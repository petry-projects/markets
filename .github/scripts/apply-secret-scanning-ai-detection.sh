#!/usr/bin/env bash
# apply-secret-scanning-ai-detection.sh — Enable secret scanning AI detection
#
# This script enables secret_scanning_ai_detection on the petry-projects/markets
# repository to satisfy the push-protection compliance requirement.
#
# The setting enables GitHub's AI-powered detection of secrets in commits, which
# supplements pattern-based scanning with ML-based detection for generic secrets
# and credentials that don't match known patterns.
#
# Standard reference:
#   https://github.com/petry-projects/.github/blob/main/standards/push-protection.md#required-repo-level-settings
#
# Usage:
#   GH_TOKEN=<admin-token> bash .github/scripts/apply-secret-scanning-ai-detection.sh
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

echo "Enabling secret_scanning_ai_detection on $REPO ..."

gh api -X PATCH "repos/$REPO" \
  --field 'security_and_analysis[secret_scanning_ai_detection][status]=enabled'

echo "Done — secret_scanning_ai_detection is now enabled on $REPO"
echo "Verify: gh api repos/$REPO --jq '.security_and_analysis.secret_scanning_ai_detection'"
