#!/usr/bin/env bash
# apply-code-quality-ruleset.sh — Idempotently create/update the code-quality ruleset
#
# This script creates (or updates) the `code-quality` repository ruleset that
# enforces required status checks on the default branch of petry-projects/markets.
#
# Required status checks configured (codified standard, source of truth:
# petry-projects/.github/standards/rulesets/code-quality.json — see #326):
#   - CodeQL                              CodeQL default setup analysis
#   - SonarCloud                          sonarcloud.yml, job: sonarcloud (name: SonarCloud)
#   - agent-shield / AgentShield          agent-shield.yml, caller job: agent-shield, reusable job: AgentShield
#   - dependency-audit / Detect ecosystems  dependency-audit.yml, caller job: dependency-audit, reusable job: Detect ecosystems
#
# Bypass actors configured (required on every ruleset targeting main — see #399):
#   - OrganizationAdmin (bypass_mode: always)  emergency admin override
#
# Standard reference:
#   https://github.com/petry-projects/.github/blob/main/standards/github-settings.md#code-quality--required-checks-ruleset-all-repositories
#   https://github.com/petry-projects/.github/blob/main/standards/github-settings.md#bypass-actors--required-on-every-ruleset-targeting-main
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

# Required bypass actor per org standard (see #399)
REQUIRED_BYPASS='{"actor_type":"OrganizationAdmin","bypass_mode":"always"}'

# When updating an existing ruleset, fetch its current bypass actors and merge them
# with the required actor so that other legitimate bypass actors are not silently removed.
if [ -n "$EXISTING_ID" ]; then
  EXISTING_BYPASS=$(gh api "repos/$REPO/rulesets/$EXISTING_ID" \
    --jq '.bypass_actors // []' 2>/dev/null || echo "[]")
  BYPASS_ACTORS=$(echo "$EXISTING_BYPASS" | \
    jq --argjson req "$REQUIRED_BYPASS" 'map(select(.actor_type != $req.actor_type)) + [$req]')
else
  BYPASS_ACTORS=$(jq -n --argjson req "$REQUIRED_BYPASS" '[$req]')
fi

PAYLOAD=$(jq -n --argjson bypass_actors "$BYPASS_ACTORS" '{
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
          {context: "CodeQL"},
          {context: "SonarCloud"},
          {context: "agent-shield / AgentShield"},
          {context: "dependency-audit / Detect ecosystems"}
        ]
      }
    }
  ],
  bypass_actors: $bypass_actors
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
