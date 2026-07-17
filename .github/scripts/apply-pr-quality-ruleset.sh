#!/usr/bin/env bash
# apply-pr-quality-ruleset.sh — Idempotently create/update the pr-quality ruleset
#
# This script creates (or updates) the `pr-quality` repository ruleset that
# enforces pull-request review requirements on the default branch of
# petry-projects/markets. It restores the codified standard after drift —
# specifically `require_code_owner_review` (see issue #323).
#
# Parameters mirror the codified source of truth:
#   petry-projects/.github → standards/rulesets/pr-quality.json
#     required_approving_review_count: 1
#     require_code_owner_review:       true
#     required_review_thread_resolution: true
#     dismiss_stale_reviews_on_push:   true
#     require_last_push_approval:      true
#
# Standard reference:
#   https://github.com/petry-projects/.github/blob/main/standards/github-settings.md#pr-quality--standard-ruleset-all-repositories
#
# Usage:
#   GH_TOKEN=<admin-token> bash .github/scripts/apply-pr-quality-ruleset.sh
#
# The org-level script (petry-projects/.github/scripts/apply-rulesets.sh) is the
# canonical tool for managing rulesets across all repos. This script exists as a
# repo-local reference and fallback for the markets repository specifically.

set -euo pipefail

REPO="petry-projects/markets"
RULESET_NAME="pr-quality"

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: GH_TOKEN is required with administration:write scope" >&2
  exit 1
fi

export GH_TOKEN

# Fetch existing rulesets
EXISTING_ID=$(gh api "repos/$REPO/rulesets" \
  --jq ".[] | select(.name == \"$RULESET_NAME\") | .id")

PAYLOAD=$(jq -n '{
  name: "pr-quality",
  target: "branch",
  enforcement: "active",
  bypass_actors: [
    {
      actor_type: "OrganizationAdmin",
      bypass_mode: "always"
    },
    {
      actor_id: 3167543,
      actor_type: "Integration",
      bypass_mode: "always"
    }
  ],
  conditions: {
    ref_name: {
      include: ["~DEFAULT_BRANCH"],
      exclude: []
    }
  },
  rules: [
    {
      type: "pull_request",
      parameters: {
        required_approving_review_count: 1,
        require_code_owner_review: true,
        required_review_thread_resolution: true,
        dismiss_stale_reviews_on_push: true,
        require_last_push_approval: true
      }
    }
  ]
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
