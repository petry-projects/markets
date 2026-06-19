#!/usr/bin/env bash
# apply-repo-settings.sh — Idempotently apply required repository settings
#
# Enforces all settings required by the petry-projects org standard:
#   https://github.com/petry-projects/.github/blob/main/standards/github-settings.md#repository-settings--standard-defaults
#
# Usage:
#   GH_TOKEN=<admin-token> bash .github/scripts/apply-repo-settings.sh
#
# The script is safe to run multiple times (idempotent). It applies settings
# using the GitHub REST API and prints the resulting values for verification.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="petry-projects/markets"

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: GH_TOKEN is required with administration:write scope" >&2
  exit 1
fi

export GH_TOKEN

echo "Applying required repository settings to $REPO ..."

gh api -X PATCH "repos/$REPO" \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=true \
  -F allow_squash_merge=true \
  -F allow_merge_commit=true \
  -F allow_rebase_merge=true \
  -F has_issues=true \
  -F has_wiki=false \
  -F squash_merge_commit_title=PR_TITLE \
  -F squash_merge_commit_message=COMMIT_MESSAGES \
  --jq '{
    delete_branch_on_merge,
    allow_auto_merge,
    allow_squash_merge,
    allow_merge_commit,
    allow_rebase_merge,
    has_issues,
    has_wiki,
    squash_merge_commit_title,
    squash_merge_commit_message
  }' | jq .

echo "Disabling CodeRabbit (347564) and Claude (1236702) check-suite auto-triggers ..."

gh api -X PATCH "repos/$REPO/check-suites/preferences" \
  --input - <<'JSON' | jq '.preferences.auto_trigger_checks'
{"auto_trigger_checks": [{"app_id": 347564, "setting": false}, {"app_id": 1236702, "setting": false}]}
JSON

echo "Enabling secret scanning non-provider patterns ..."

bash "$SCRIPT_DIR/apply-secret-scanning-non-provider-patterns.sh"

echo "Done — repository settings applied: https://github.com/$REPO/settings"
