package firebase

import (
	"context"
	"fmt"

	fb "firebase.google.com/go/v4"
	firebaseauth "firebase.google.com/go/v4/auth"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

// InitApp initializes the Firebase Admin app.
func InitApp(ctx context.Context, credentialsPath string) (*fb.App, error) {
	var opts []option.ClientOption
	if credentialsPath != "" {
		opts = append(opts, option.WithCredentialsFile(credentialsPath))
	}
	app, err := fb.NewApp(ctx, nil, opts...)
	if err != nil {
		return nil, fmt.Errorf("firebase init: %w", err)
	}
	return app, nil
}

// AuthClient creates a Firebase Auth client from the app.
func AuthClient(ctx context.Context, app *fb.App) (*firebaseauth.Client, error) {
	client, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("firebase auth client: %w", err)
	}
	return client, nil
}

// MessagingClient creates a Firebase Cloud Messaging client from the app.
func MessagingClient(ctx context.Context, app *fb.App) (*messaging.Client, error) {
	client, err := app.Messaging(ctx)
	if err != nil {
		return nil, fmt.Errorf("firebase messaging client: %w", err)
	}
	return client, nil
}

// FCMAdapter wraps the Firebase messaging client to implement notify.FCMClient.
type FCMAdapter struct {
	Client *messaging.Client
}

// SendToTopic sends a notification to a Firebase topic.
func (a *FCMAdapter) SendToTopic(ctx context.Context, topic, title, body string, data map[string]string) error {
	msg := &messaging.Message{
		Topic: topic,
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data: data,
	}
	_, err := a.Client.Send(ctx, msg)
	return err
}
