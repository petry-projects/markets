#!/bin/bash
# Run the full CI quality checks locally to mirror what CI does.
# Usage: ./scripts/ci-local.sh [frontend|backend|all]

set -euo pipefail

SCOPE="${1:-all}"

run_frontend() {
  echo "━━━ Frontend CI ━━━"
  cd markets-app

  echo "→ Installing dependencies..."
  npm ci --silent

  echo "→ Type checking..."
  npx tsc --noEmit

  echo "→ Linting..."
  npx eslint . --max-warnings 0

  echo "→ Format checking..."
  npx prettier --check .

  echo "→ Running tests with coverage..."
  npx jest --ci --coverage --coverageReporters=text --coverageReporters=json-summary

  echo "→ Checking coverage threshold..."
  COVERAGE=$(node -e "const s = require('./coverage/coverage-summary.json'); console.log(s.total.statements.pct)")
  echo "  Statement coverage: ${COVERAGE}%"

  echo "→ Checking codegen..."
  npm run codegen:check

  cd ..
  echo "✅ Frontend CI passed"
}

run_backend() {
  echo "━━━ Backend CI ━━━"
  cd markets-api

  echo "→ Building..."
  go build ./cmd/api/

  echo "→ Running tests with race detector..."
  go test $(go list ./... | grep -v /generated) -short -count=1 -race

  echo "→ Validating GraphQL schema..."
  go run github.com/99designs/gqlgen validate

  cd ..
  echo "✅ Backend CI passed"
}

case "$SCOPE" in
  frontend) run_frontend ;;
  backend)  run_backend ;;
  all)
    run_backend
    echo ""
    run_frontend
    echo ""
    echo "✅ All CI checks passed"
    ;;
  *)
    echo "Usage: $0 [frontend|backend|all]"
    exit 1
    ;;
esac
