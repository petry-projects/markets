package config

import (
	"fmt"
	"os"
)

// Config holds application configuration loaded from environment variables.
type Config struct {
	Port                string
	DatabaseURL         string
	FirebaseCredentials string
	Environment         string
}

// Load reads configuration from environment variables.
// DATABASE_URL is required; all other values have sensible defaults.
func Load() (*Config, error) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}
	return &Config{
		Port:                port,
		DatabaseURL:         dbURL,
		FirebaseCredentials: os.Getenv("FIREBASE_CREDENTIALS"),
		Environment:         env,
	}, nil
}
