# GCP DEV Environment Setup

One-time manual setup for the Markets GCP project. After this, all deployments are automated via GitHub Actions.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- Access to the GCP project `markets-491920` (project number: 471156433581)

## 1. Authenticate

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project markets-491920
```

## 2. Enable APIs (first time only)

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  sts.googleapis.com \
  identitytoolkit.googleapis.com
```

## 3. Create Terraform State Bucket (first time only)

```bash
gcloud storage buckets create gs://markets-491920-tfstate \
  --project markets-491920 \
  --location us-central1 \
  --uniform-bucket-level-access

gcloud storage buckets update gs://markets-491920-tfstate --versioning
```

## 4. Create OAuth Credentials (one-time per provider)

Before provisioning infrastructure, create OAuth credentials for each auth provider.

### 4a. Google OAuth

1. Go to [GCP Credentials](https://console.cloud.google.com/apis/credentials?project=markets-491920)
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `Markets Web Client`
5. Authorized JavaScript origins: `http://localhost:8081` (dev), plus your production domain
6. Authorized redirect URIs: `https://markets-491920.firebaseapp.com/__/auth/handler`
7. Save the **Client ID** and **Client Secret**

### 4b. Apple Sign-In

1. Go to [Apple Developer → Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources)
2. Register an **App ID** with "Sign in with Apple" capability
3. Create a **Services ID** (this is your `client_id`)
4. Configure the service with your domain and redirect URL: `https://markets-491920.firebaseapp.com/__/auth/handler`
5. Create a **Key** with "Sign in with Apple" enabled — download the `.p8` key file
6. Generate the client secret JWT (see [Apple docs](https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens))

### 4c. Facebook Login

1. Go to [Facebook Developer Console](https://developers.facebook.com/apps/)
2. Create a new app (type: **Consumer**)
3. Add the **Facebook Login** product
4. Under Settings → Basic, copy the **App ID** and **App Secret**
5. Under Facebook Login → Settings, add redirect URI: `https://markets-491920.firebaseapp.com/__/auth/handler`

### 4d. Provision Infrastructure with Terraform

```bash
cd infra

# Generate a database password (first time only)
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')

# Set OAuth credentials (from steps 4a-4c above)
export TF_VAR_google_oauth_client_id="<your-google-client-id>"
export TF_VAR_google_oauth_client_secret="<your-google-client-secret>"
export TF_VAR_apple_oauth_client_id="<your-apple-services-id>"
export TF_VAR_apple_oauth_client_secret="<your-apple-client-secret>"
export TF_VAR_facebook_oauth_app_id="<your-facebook-app-id>"
export TF_VAR_facebook_oauth_app_secret="<your-facebook-app-secret>"

# Initialize (connects to GCS backend)
terraform init -backend-config=environments/dev/backend.hcl

# Plan
terraform plan \
  -var-file=environments/dev/terraform.tfvars \
  -var="db_password=${DB_PASS}" \
  -var="api_image=us-docker.pkg.dev/cloudrun/container/hello:latest" \
  -out=tfplan

# Apply (~10 min for Cloud SQL on first run)
terraform apply tfplan
```

Save the outputs — you'll need them for GitHub secrets:

```bash
terraform output
```

Expected outputs:
- `api_url` — Cloud Run service URL
- `db_connection_name` — Cloud SQL instance connection name (e.g. `markets-491920:us-central1:markets-dev`)
- `artifact_registry` — Docker registry path
- `wif_provider` — Workload Identity Provider (for GitHub Actions)
- `wif_service_account` — Service account email (for GitHub Actions)
- `google_web_client_id` — set as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in app `.env`
- `facebook_app_id` — set as `EXPO_PUBLIC_FACEBOOK_APP_ID` in app `.env`

## 5. Configure GitHub Repository Secrets

From `terraform output` and your OAuth credentials (step 4), set these secrets in
**Settings > Secrets and variables > Actions**:

| Secret | Source |
|--------|--------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `terraform output -raw wif_provider` |
| `GCP_SERVICE_ACCOUNT` | `terraform output -raw wif_service_account` |
| `DB_PASSWORD` | The `$DB_PASS` you generated in step 4d |
| `CLOUD_SQL_CONNECTION_NAME` | `terraform output -raw db_connection_name` |
| `GOOGLE_OAUTH_CLIENT_ID` | Google Web Client ID (step 4a) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google Web Client Secret (step 4a) |
| `APPLE_OAUTH_CLIENT_ID` | Apple Services ID (step 4b) |
| `APPLE_OAUTH_CLIENT_SECRET` | Apple client secret JWT (step 4b) |
| `FACEBOOK_OAUTH_APP_ID` | Facebook App ID (step 4c) |
| `FACEBOOK_OAUTH_APP_SECRET` | Facebook App Secret (step 4c) |

Using the GitHub CLI:

```bash
# Infrastructure secrets
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body "$(terraform output -raw wif_provider)"
gh secret set GCP_SERVICE_ACCOUNT --body "$(terraform output -raw wif_service_account)"
gh secret set DB_PASSWORD --body "${DB_PASS}"
gh secret set CLOUD_SQL_CONNECTION_NAME --body "$(terraform output -raw db_connection_name)"

# OAuth provider secrets (used by Terraform in CI/CD to configure Firebase auth)
gh secret set GOOGLE_OAUTH_CLIENT_ID --body "${TF_VAR_google_oauth_client_id}"
gh secret set GOOGLE_OAUTH_CLIENT_SECRET --body "${TF_VAR_google_oauth_client_secret}"
gh secret set APPLE_OAUTH_CLIENT_ID --body "${TF_VAR_apple_oauth_client_id}"
gh secret set APPLE_OAUTH_CLIENT_SECRET --body "${TF_VAR_apple_oauth_client_secret}"
gh secret set FACEBOOK_OAUTH_APP_ID --body "${TF_VAR_facebook_oauth_app_id}"
gh secret set FACEBOOK_OAUTH_APP_SECRET --body "${TF_VAR_facebook_oauth_app_secret}"
```

## 6. Configure Frontend Environment

After Terraform provisions the auth providers, update `markets-app/.env` with the OAuth client IDs:

```bash
# From the project root
cd markets-app

# Add Google Web Client ID (required for Google Sign-In on web)
echo "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=${TF_VAR_google_oauth_client_id}" >> .env

# Add Facebook App ID (required for Facebook Login on web)
echo "EXPO_PUBLIC_FACEBOOK_APP_ID=${TF_VAR_facebook_oauth_app_id}" >> .env
```

These are public client IDs (not secrets) — they are embedded in the frontend bundle.

## 7. Run First Deployment

Trigger the deploy workflow manually:

```bash
gh workflow run deploy.yml -f environment=dev
```

Or push to `main` — the deploy workflow runs automatically on push to main when `markets-api/**` changes.

## 8. Verify

```bash
API_URL=$(terraform output -raw api_url)
curl -sf "${API_URL}/healthz"
# → {"status":"ok"}
```

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  GitHub Actions  │────>│ Artifact Registry │
│  (build + push)  │     │  (Docker images)  │
└────────┬────────┘     └──────────────────┘
         │ terraform apply + deploy
         v
┌─────────────────┐     ┌──────────────────┐
│   Cloud Run     │────>│   Cloud SQL      │
│  (markets-api)  │     │  (PostgreSQL 15) │
└─────────────────┘     └──────────────────┘
         │
┌─────────────────┐
│  Identity Platform (Firebase Auth)
│  ├── Google Sign-In
│  ├── Apple Sign-In
│  └── Facebook Login
└─────────────────┘
```

## Environments

| Environment | Project | Cloud SQL Tier | Min Instances | Branch |
|------------|---------|---------------|:------------:|--------|
| dev | markets-491920 | db-f1-micro | 0 | main |
| staging | TBD | db-f1-micro | 0 | release/* |
| production | TBD | db-custom-2-7680 | 1 | tags/v* |

## Troubleshooting

**Cloud Run logs:**
```bash
gcloud run services logs read markets-api-dev --region us-central1
```

**Cloud SQL proxy (local access):**
```bash
cloud-sql-proxy --port 5432 $(terraform output -raw db_connection_name)
```

**Run migrations manually against Cloud SQL:**
```bash
export DATABASE_URL="postgres://markets:${DB_PASS}@localhost:5432/markets_dev?sslmode=disable"
cloud-sql-proxy --port 5432 $(terraform output -raw db_connection_name) &
migrate -path=markets-api/migrations -database "$DATABASE_URL" up
```

## Tear Down

```bash
cd infra
terraform destroy -var-file=environments/dev/terraform.tfvars -var="db_password=x" -var="api_image=x"
gcloud storage rm -r gs://markets-491920-tfstate
```
