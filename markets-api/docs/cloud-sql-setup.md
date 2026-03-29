# Cloud SQL PostgreSQL Setup

## Instance Configuration

- **Engine:** PostgreSQL 15+
- **Tier:** db-f1-micro (development), db-custom-2-7680 (production)
- **Region:** us-central1 (or closest to target users)
- **Storage:** 10GB SSD (auto-increase enabled)
- **Backups:** Automated daily backups, 7-day retention
- **High Availability:** Disabled for dev, enabled for production
- **Maintenance Window:** Sunday 02:00-06:00 UTC

## Cloud SQL Auth Proxy (Local Development)

The Cloud SQL Auth Proxy provides secure, IAM-based access to Cloud SQL without exposing the database to the public internet.

### Setup

1. Install the proxy:
   ```bash
   # macOS
   brew install cloud-sql-proxy

   # Or download directly
   curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.3/cloud-sql-proxy.darwin.amd64
   chmod +x cloud-sql-proxy
   ```

2. Authenticate with GCP:
   ```bash
   gcloud auth application-default login
   ```

3. Run the proxy:
   ```bash
   cloud-sql-proxy --port 5432 PROJECT_ID:REGION:INSTANCE_NAME
   ```

4. Set the database URL environment variable:
   ```bash
   export DATABASE_URL="postgres://user:password@localhost:5432/markets?sslmode=disable"
   ```

### Connection String Format

```
postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=disable
```

For local development with auth proxy:
```
postgres://markets-user:password@localhost:5432/markets_dev?sslmode=disable
```
