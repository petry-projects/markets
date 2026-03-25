---
name: Technology Stack Decisions
description: Confirmed stack decisions — React Native/Expo + React Native for Web, Go backend on GCP Cloud Run, Firebase Auth, Cloud SQL PostgreSQL
type: project
---

Confirmed technology stack (2026-03-21):

**Frontend:** React Native + Expo (mobile-first), published to web via React Native for Web
**Auth:** Firebase Authentication
**Database:** Cloud SQL (PostgreSQL)
**Backend:** Containerized Go on Cloud Run
**API Layer:** GraphQL (likely gqlgen in Go)
**Hosting:** Google Cloud Platform (GCP)

**Why:** User chose GCP alignment over Supabase BaaS. Go backend provides full control over business logic, audit logging, and real-time coordination.

**How to apply:** The original technical research evaluated Supabase as BaaS — those sections are now superseded. Supabase-specific features (pg_graphql, RLS, Realtime, Edge Functions, PostgREST) are replaced by GCP equivalents and custom Go implementation.
