package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	firebaseauth "firebase.google.com/go/v4/auth"
	"firebase.google.com/go/v4/messaging"
	"github.com/petry-projects/markets-api/internal/audit"
	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/config"
	"github.com/petry-projects/markets-api/internal/db"
	"github.com/petry-projects/markets-api/internal/events"
	fbinit "github.com/petry-projects/markets-api/internal/firebase"
	"github.com/petry-projects/markets-api/internal/graph"
	"github.com/petry-projects/markets-api/internal/graph/generated"
	"github.com/petry-projects/markets-api/internal/middleware"
	"github.com/petry-projects/markets-api/internal/notify"
	"github.com/petry-projects/markets-api/internal/realtime"
)

func main() {
	ctx := context.Background()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	// Initialize database pool
	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// Initialize Firebase (optional in development — server starts without it)
	var authClient *firebaseauth.Client
	var msgClient *messaging.Client

	fbApp, err := fbinit.InitApp(ctx, cfg.FirebaseCredentials)
	if err != nil {
		if cfg.Environment == "development" {
			slog.Warn("Firebase unavailable — auth middleware disabled", "error", err)
		} else {
			slog.Error("failed to initialize Firebase", "error", err)
			os.Exit(1)
		}
	} else {
		authClient, err = fbinit.AuthClient(ctx, fbApp)
		if err != nil {
			if cfg.Environment == "development" {
				slog.Warn("Firebase Auth unavailable — auth middleware disabled", "error", err)
			} else {
				slog.Error("failed to create Firebase auth client", "error", err)
				os.Exit(1)
			}
		}

		msgClient, err = fbinit.MessagingClient(ctx, fbApp)
		if err != nil {
			if cfg.Environment == "development" {
				slog.Warn("Firebase Messaging unavailable — notifications disabled", "error", err)
			} else {
				slog.Error("failed to create Firebase messaging client", "error", err)
				os.Exit(1)
			}
		}
	}

	// Create repositories
	userRepo := db.NewPgUserRepository(pool)
	marketRepo := db.NewPgMarketRepository(pool)
	vendorRepo := db.NewPgVendorRepository(pool)
	customerRepo := db.NewPgCustomerRepository(pool)
	notifyRepo := db.NewPgNotifyRepository(pool)
	auditQuerier := audit.NewQuerier(pool)

	// Create event bus and subscribe handlers
	eventBus := events.NewBus()

	if msgClient != nil {
		fcmAdapter := &fbinit.FCMAdapter{Client: msgClient}
		notifyHandler := notify.NewHandlerWithRepo(fcmAdapter, notifyRepo)
		eventBus.Subscribe(notifyHandler)
	} else {
		slog.Warn("FCM notifications disabled — no messaging client")
	}

	// Firebase Realtime DB — use a no-op client if not configured
	// (Realtime DB requires additional setup beyond the Admin SDK)
	realtimeHandler := realtime.NewHandler(&noopRealtimeDB{})
	eventBus.Subscribe(realtimeHandler)

	// Create GraphQL resolver with all dependencies
	resolver := graph.NewFullResolver(
		pool, eventBus, userRepo, authClient,
		marketRepo, vendorRepo, customerRepo,
		notifyRepo, auditQuerier,
	)

	// Create gqlgen executable schema
	schema := generated.NewExecutableSchema(generated.Config{
		Resolvers: resolver,
	})

	// Create gqlgen handler
	gqlHandler := handler.New(schema)
	gqlHandler.AddTransport(transport.Options{})
	gqlHandler.AddTransport(transport.POST{})
	gqlHandler.Use(extension.Introspection{})

	// Build HTTP routes
	mux := http.NewServeMux()

	// Health check — unauthenticated (no method restriction for Cloud Run probes)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"ok"}`)
	})

	// GraphQL endpoint — with middleware chain
	var gqlWithMiddleware http.Handler
	if authClient != nil {
		authMW := auth.NewMiddleware(authClient)
		gqlWithMiddleware = middleware.CORS(middleware.RequestLogger(authMW(gqlHandler)))
	} else {
		slog.Warn("Auth middleware disabled — all requests are unauthenticated")
		gqlWithMiddleware = middleware.CORS(middleware.RequestLogger(gqlHandler))
	}
	mux.Handle("POST /query", gqlWithMiddleware)

	// Also handle OPTIONS for CORS preflight on /query
	mux.HandleFunc("OPTIONS /query", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
	})

	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	shutdownCtx, stop := signal.NotifyContext(ctx, syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		slog.Info("server starting", "port", cfg.Port, "environment", cfg.Environment)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	<-shutdownCtx.Done()
	slog.Info("shutting down server...")

	drainCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(drainCtx); err != nil {
		slog.Error("server shutdown error", "error", err)
	}

	slog.Info("server stopped")
}

// noopRealtimeDB is a no-op implementation of realtime.DatabaseClient
// used when Firebase Realtime Database is not configured.
type noopRealtimeDB struct{}

func (n *noopRealtimeDB) Set(_ context.Context, path string, _ interface{}) error {
	slog.Debug("realtime db write (no-op)", "path", path)
	return nil
}
