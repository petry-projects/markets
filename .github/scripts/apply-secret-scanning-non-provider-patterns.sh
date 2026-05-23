#!/usr/bin/env bash
# apply-secret-scanning-non-provider-patterns.sh — Enable secret scanning non-provider patterns
#
# This script enables secret_scanning_non_provider_patterns on the petry-projects/markets
# repository to satisfy the push-protection compliance requirement.
#
# The setting enables GitHub's detection of secrets that match generic, non-provider-specific
# patterns (e.g. private keys, connection strings, and other high-confidence generic secrets)
# that are not covered by provider-specific patterns.
#
# Standard reference:
#   https://github.com/petry-projects/.github/blob/main/standards/push-protection.md#required-repo-level-settings
#
# Usage:
#   GH_TOKEN=<admin-token> bash .github/scripts/apply-secret-scanning-non-provider-patterns.sh
#
# Requires: GH_TOKEN with administration:write scope (security_and_analysis updates
# require admin access; the audit token may return null without this scope, producing
# false-positive compliance findings).

set -euo pipefail

REPO="petry-projects/markets"

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: GH_TOKEN is required with administration:write scope" >&2
  exit 1
fi

export GH_TOKEN

echo "Enabling secret_scanning_non_provider_patterns on $REPO ..."

gh api -X PATCH "repos/$REPO" \
  --field 'security_and_analysis[secret_scanning_non_provider_patterns][status]=enabled'

echo "Done — secret_scanning_non_provider_patterns is now enabled on $REPO"
echo "Verify: gh api repos/$REPO --jq '.security_and_analysis.secret_scanning_non_provider_patterns'"
