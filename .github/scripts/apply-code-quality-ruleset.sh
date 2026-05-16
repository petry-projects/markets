#!/usr/bin/env bash
# apply-code-quality-ruleset.sh — Idempotently create/update the code-quality ruleset
#
# This script creates (or updates) the `code-quality` repository ruleset that
# enforces required status checks on the default branch of petry-projects/markets.
#
# Required status checks configured (derived from actual CI check run names):
#   - SonarCloud          sonarcloud.yml, job: sonarcloud (name: SonarCloud)
#   - Analyze (actions)   codeql.yml, job: analyze (name: Analyze), language: actions
#   - dev-lead / dispatch  dev-lead.yml, caller job: dev-lead, reusable job: dispatch
#
# Standard reference:
#   https://github.com/petry-projects/.github/blob/main/standards/github-settings.md#code-quality--required-checks-ruleset-all-repositories
#
# Usage:
#   GH_TOKEN=<admin-token> bash .github/scripts/apply-code-quality-ruleset.sh
#
# The org-level script (petry-projects/.github/scripts/apply-rulesets.sh) is the
# canonical tool for managing rulesets across all repos. This script exists as a
# repo-local reference and fallback for the markets repository specifically.

set -euo pipefail

REPO="petry-projects/markets"
RULESET_NAME="code-quality"

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: GH_TOKEN is required with administration:write scope" >&2
  exit 1
fi

export GH_TOKEN

# Fetch existing rulesets
EXISTING_ID=$(gh api "repos/$REPO/rulesets" \
  --jq ".[] | select(.name == \"$RULESET_NAME\") | .id" 2>/dev/null || true)

PAYLOAD=$(jq -n '{
  name: "code-quality",
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
        strict_required_status_checks_policy: true,
        required_status_checks: [
          {context: "SonarCloud"},
          {context: "Analyze (actions)"},
          {context: "dev-lead / dispatch"}
        ]
      }
    }
  ],
  bypass_actors: []
}')

if [ -n "$EXISTING_ID" ]; then
  echo "Updating existing $RULESET_NAME ruleset (id=$EXISTING_ID) ..."
  echo "$PAYLOAD" | gh api -X PUT "repos/$REPO/rulesets/$EXISTING_ID" --input - > /dev/null
  echo "Done — ruleset updated: https://github.com/$REPO/rules/$EXISTING_ID"
else
  echo "Creating $RULESET_NAME ruleset ..."
  RESULT=$(echo "$PAYLOAD" | gh api -X POST "repos/$REPO/rulesets" --input -)
  NEW_ID=$(echo "$RESULT" | jq -r '.id')
  echo "Done — ruleset created: https://github.com/$REPO/rules/$NEW_ID"
fi
