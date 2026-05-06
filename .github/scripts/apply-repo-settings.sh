#!/usr/bin/env bash
# apply-repo-settings.sh — Idempotently apply required repository settings
#
# Enforces all settings required by the petry-projects org standard:
#   https://github.com/petry-projects/.github/blob/main/standards/github-settings.md#repository-settings--standard-defaults
#
# Usage:
#   GH_TOKEN=<admin-token> bash .github/scripts/apply-repo-settings.sh
#
# The script is safe to run multiple times (idempotent). It fetches and prints
# the current relevant settings, applies the required settings using the
# GitHub REST API, and prints the resulting settings response.
#
# Requirements:
#   - GH_TOKEN must have administration:write scope (repo admin role)
#   - gh CLI must be installed
#   - jq must be installed
#
# The org-level script (petry-projects/.github/scripts/apply-repo-settings.sh)
# is the canonical tool for managing settings across all repos. This script
# exists as a repo-local reference and fallback for the markets repository.

set -euo pipefail

REPO="petry-projects/markets"

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: GH_TOKEN is required with administration:write scope" >&2
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required but not found in PATH" >&2
  exit 1
fi

export GH_TOKEN

echo "Fetching current settings for $REPO ..."
current=$(gh api "repos/$REPO" --jq '{
  allow_auto_merge: .allow_auto_merge,
  delete_branch_on_merge: .delete_branch_on_merge,
  allow_squash_merge: .allow_squash_merge,
  allow_merge_commit: .allow_merge_commit,
  allow_rebase_merge: .allow_rebase_merge,
  has_discussions: .has_discussions,
  has_issues: .has_issues,
  has_wiki: .has_wiki,
  squash_merge_commit_title: .squash_merge_commit_title,
  squash_merge_commit_message: .squash_merge_commit_message
}')

echo "Current settings:"
echo "$current" | jq .

echo ""
echo "Applying required settings to $REPO ..."
gh api -X PATCH "repos/$REPO" \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=true \
  -F allow_squash_merge=true \
  -F allow_merge_commit=true \
  -F allow_rebase_merge=true \
  -F has_discussions=true \
  -F has_issues=true \
  -F has_wiki=false \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=COMMIT_MESSAGES \
  --jq '{
    delete_branch_on_merge,
    allow_auto_merge,
    allow_squash_merge,
    allow_merge_commit,
    allow_rebase_merge,
    has_discussions,
    has_issues,
    has_wiki,
    squash_merge_commit_title,
    squash_merge_commit_message
  }' | jq .

echo ""
echo "Done — repository settings applied: https://github.com/$REPO/settings"
