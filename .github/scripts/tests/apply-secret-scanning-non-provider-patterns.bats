#!/usr/bin/env bats
# Tests for apply-secret-scanning-non-provider-patterns.sh — static content
# assertions, no live API calls.

SCRIPT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/apply-secret-scanning-non-provider-patterns.sh"

@test "script exists and is executable" {
  [ -f "$SCRIPT" ]
  [ -x "$SCRIPT" ]
}

@test "script uses set -euo pipefail" {
  grep -q 'set -euo pipefail' "$SCRIPT"
}

@test "script targets petry-projects/markets repo" {
  grep -q 'petry-projects/markets' "$SCRIPT"
}

@test "script PATCHes secret_scanning_non_provider_patterns to enabled" {
  grep -q 'gh api -X PATCH' "$SCRIPT"
  grep -q 'secret_scanning_non_provider_patterns' "$SCRIPT"
  grep -qE 'secret_scanning_non_provider_patterns.*status.*=enabled' "$SCRIPT"
}

@test "script requires GH_TOKEN" {
  grep -q 'GH_TOKEN' "$SCRIPT"
}
