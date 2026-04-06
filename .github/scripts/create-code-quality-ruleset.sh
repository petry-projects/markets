#!/usr/bin/env bash
# Creates the "code-quality" repository ruleset for petry-projects/markets.
#
# Standard:
#   https://github.com/petry-projects/.github/blob/main/standards/github-settings.md#code-quality--required-checks-ruleset-all-repositories
#
# This script is idempotent — it exits cleanly if the ruleset already exists.
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated
#   - Token must have repo admin or org admin rights (so it can manage rulesets)
#
# Usage:
#   gh auth login          # if not already authenticated
#   bash .github/scripts/create-code-quality-ruleset.sh

set -euo pipefail

REPO="petry-projects/markets"
RULESET_NAME="code-quality"

echo "▶ Checking for existing '${RULESET_NAME}' ruleset on ${REPO}…"

EXISTING_ID=$(gh api "repos/${REPO}/rulesets" \
  --jq ".[] | select(.name == \"${RULESET_NAME}\") | .id" 2>/dev/null || true)

if [ -n "${EXISTING_ID}" ]; then
  echo "✔ Ruleset '${RULESET_NAME}' already exists (ID: ${EXISTING_ID}). Nothing to do."
  exit 0
fi

echo "▶ Creating '${RULESET_NAME}' ruleset…"

cat <<'JSON' | gh api "repos/${REPO}/rulesets" --method POST --input -
{
  "name": "code-quality",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "SonarCloud" },
          { "context": "Dependency audit / npm audit" }
        ]
      }
    }
  ]
}
JSON

echo "✔ Ruleset '${RULESET_NAME}' created successfully."
echo ""
echo "Verify with:"
echo "  gh api repos/${REPO}/rulesets --jq '.[] | select(.name == \"${RULESET_NAME}\")'"
