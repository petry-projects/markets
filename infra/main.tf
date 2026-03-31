terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    # Configured per-environment in environments/<env>/backend.hcl
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ─── Variables ───

variable "project_id" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "GCP region for all resources"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, production)"
}

variable "db_tier" {
  type        = string
  default     = "db-f1-micro"
  description = "Cloud SQL machine tier"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "PostgreSQL password for the markets user"
}

variable "api_image" {
  type        = string
  description = "Docker image URL for the API (e.g. us-central1-docker.pkg.dev/PROJECT/markets/api:latest)"
}

# ─── Enable Required APIs ───

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

# ─── Artifact Registry ───

resource "google_artifact_registry_repository" "markets" {
  location      = var.region
  repository_id = "markets"
  format        = "DOCKER"
  description   = "Markets API container images"

  depends_on = [google_project_service.apis]
}

# ─── Cloud SQL (PostgreSQL) ───

resource "google_sql_database_instance" "markets" {
  name             = "markets-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_size         = 10
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "production"
      start_time                     = "02:00"
      backup_retention_settings {
        retained_backups = 7
      }
    }

    ip_configuration {
      ipv4_enabled = false
      # Private IP via VPC — Cloud Run uses Cloud SQL Connector
    }

    database_flags {
      name  = "log_statement"
      value = "ddl"
    }
  }

  deletion_protection = var.environment == "production"

  depends_on = [google_project_service.apis]
}

resource "google_sql_database" "markets" {
  name     = "markets_${var.environment}"
  instance = google_sql_database_instance.markets.name
}

resource "google_sql_user" "markets" {
  name     = "markets"
  instance = google_sql_database_instance.markets.name
  password = var.db_password
}

# ─── Service Account for Cloud Run ───

resource "google_service_account" "api" {
  account_id   = "markets-api-${var.environment}"
  display_name = "Markets API (${var.environment})"
}

resource "google_project_iam_member" "api_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_firebase" {
  project = var.project_id
  role    = "roles/firebase.sdkAdminServiceAgent"
  member  = "serviceAccount:${google_service_account.api.email}"
}

# ─── Cloud Run ───

resource "google_cloud_run_v2_service" "api" {
  name     = "markets-api-${var.environment}"
  location = var.region

  template {
    service_account = google_service_account.api.email

    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
      max_instance_count = var.environment == "production" ? 10 : 2
    }

    containers {
      image = var.api_image

      ports {
        container_port = 8080
      }

      env {
        name  = "PORT"
        value = "8080"
      }
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "DATABASE_URL"
        value = "postgres://markets:${var.db_password}@/${google_sql_database.markets.name}?host=/cloudsql/${google_sql_database_instance.markets.connection_name}"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/healthz"
        }
        initial_delay_seconds = 5
        period_seconds        = 5
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/healthz"
        }
        period_seconds = 30
      }
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.markets.connection_name]
      }
    }
  }

  depends_on = [google_project_service.apis]
}

# Allow unauthenticated access (public API)
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.api.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─── Outputs ───

output "api_url" {
  value       = google_cloud_run_v2_service.api.uri
  description = "Cloud Run API URL"
}

output "db_connection_name" {
  value       = google_sql_database_instance.markets.connection_name
  description = "Cloud SQL connection name for proxy"
}

output "artifact_registry" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.markets.repository_id}"
  description = "Docker registry URL"
}
