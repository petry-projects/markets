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
  sts.googleapis.com
```

## 3. Create Terraform State Bucket (first time only)

```bash
gcloud storage buckets create gs://markets-491920-tfstate \
  --project markets-491920 \
  --location us-central1 \
  --uniform-bucket-level-access

gcloud storage buckets update gs://markets-491920-tfstate --versioning
```

## 4. Provision Infrastructure with Terraform

```bash
cd infra

# Generate a database password
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')

# Initialize (connects to GCS backend)
terraform init -backend-config=environments/dev/backend.hcl

# Plan
terraform plan \
  -var-file=environments/dev/terraform.tfvars \
  -var="db_password=${DB_PASS}" \
  -var="api_image=us-docker.pkg.dev/cloudrun/container/hello:latest" \
  -out=tfplan

# Apply (~10 min for Cloud SQL)
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

## 5. Configure GitHub Repository Secrets

From `terraform output`, set these secrets in the GitHub repository settings
(**Settings > Secrets and variables > Actions**):

| Secret | Source |
|--------|--------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `terraform output -raw wif_provider` |
| `GCP_SERVICE_ACCOUNT` | `terraform output -raw wif_service_account` |
| `DB_PASSWORD` | The `$DB_PASS` you generated in step 4 |
| `CLOUD_SQL_CONNECTION_NAME` | `terraform output -raw db_connection_name` |

Using the GitHub CLI:

```bash
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body "$(terraform output -raw wif_provider)"
gh secret set GCP_SERVICE_ACCOUNT --body "$(terraform output -raw wif_service_account)"
gh secret set DB_PASSWORD --body "${DB_PASS}"
gh secret set CLOUD_SQL_CONNECTION_NAME --body "$(terraform output -raw db_connection_name)"
```

## 6. Run First Deployment

Trigger the deploy workflow manually:

```bash
gh workflow run deploy.yml -f environment=dev
```

Or push to `main` — the deploy workflow runs automatically on push to main when `markets-api/**` changes.

## 7. Verify

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
         │ deploy
         v
┌─────────────────┐     ┌──────────────────┐
│   Cloud Run     │────>│   Cloud SQL      │
│  (markets-api)  │     │  (PostgreSQL 15) │
└─────────────────┘     └──────────────────┘
         │
    Firebase Auth
    (token verification)
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
