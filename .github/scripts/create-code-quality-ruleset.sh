#!/usr/bin/env bash
# create-code-quality-ruleset.sh
#
# Idempotently creates (or updates) the "code-quality" repository ruleset
# with the required status checks defined in the org standard:
#   standards/github-settings.md#code-quality--required-checks-ruleset-all-repositories
#
# Requirements:
#   - gh CLI authenticated with a token that has `administration:write` on the repo
#   - jq installed
#
# Usage:
#   export GH_TOKEN=<your-admin-token>
#   bash .github/scripts/create-code-quality-ruleset.sh
#
# Or with explicit repo:
#   REPO=owner/repo bash .github/scripts/create-code-quality-ruleset.sh

set -euo pipefail

REPO="${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
RULESET_NAME="code-quality"

echo "==> Targeting repository: ${REPO}"

# ---------------------------------------------------------------------------
# Required status checks (must match the exact check name shown in GitHub UI)
# Sources:
#   .github/workflows/codeql.yml          → job "analyze"  (display: "Analyze")
#   .github/workflows/sonarcloud.yml      → job "sonarcloud" (display: "SonarCloud")
#   .github/workflows/dependency-audit.yml → job "detect"  (display: "Detect ecosystems")
# ---------------------------------------------------------------------------
REQUIRED_CHECKS=$(cat <<'EOF'
[
  { "context": "Analyze" },
  { "context": "SonarCloud" },
  { "context": "Detect ecosystems" }
]
EOF
)

# Build the ruleset payload
PAYLOAD=$(jq -n \
  --arg name "${RULESET_NAME}" \
  --argjson checks "${REQUIRED_CHECKS}" \
  '{
    name: $name,
    target: "branch",
    enforcement: "active",
    conditions: {
      ref_name: {
        include: ["~DEFAULT_BRANCH"],
        exclude: []
      }
    },
    rules: [
      {
        type: "required_status_checks",
        parameters: {
          strict_required_status_checks_policy: false,
          required_status_checks: $checks
        }
      }
    ]
  }'
)

# ---------------------------------------------------------------------------
# Check if a ruleset with this name already exists
# ---------------------------------------------------------------------------
EXISTING_ID=$(gh api "repos/${REPO}/rulesets" \
  --jq ".[] | select(.name == \"${RULESET_NAME}\") | .id" 2>/dev/null || true)

if [[ -n "${EXISTING_ID}" ]]; then
  echo "==> Ruleset '${RULESET_NAME}' already exists (id=${EXISTING_ID}). Updating…"
  gh api "repos/${REPO}/rulesets/${EXISTING_ID}" \
    --method PUT \
    --input - <<< "${PAYLOAD}"
  echo "==> Updated ruleset id=${EXISTING_ID}"
else
  echo "==> Creating ruleset '${RULESET_NAME}'…"
  RESULT=$(gh api "repos/${REPO}/rulesets" \
    --method POST \
    --input - <<< "${PAYLOAD}")
  NEW_ID=$(echo "${RESULT}" | jq -r '.id')
  echo "==> Created ruleset id=${NEW_ID}"
fi

echo "==> Done. Verify at: https://github.com/${REPO}/settings/rules"
