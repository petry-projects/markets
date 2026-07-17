#!/usr/bin/env bats
# Tests for apply-pr-quality-ruleset.sh — static content assertions, no live API calls.

SCRIPT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/apply-pr-quality-ruleset.sh"

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

@test "script codifies the pr-quality ruleset name" {
  grep -q 'RULESET_NAME="pr-quality"' "$SCRIPT"
}

@test "script pins dismiss_stale_reviews_on_push to true (issue #324)" {
  grep -qE 'dismiss_stale_reviews_on_push:\s*true' "$SCRIPT"
}

@test "script requires GH_TOKEN with admin scope" {
  grep -q 'GH_TOKEN' "$SCRIPT"
}

@test "script encodes the pull_request rule with the standard review params" {
  grep -q 'require_last_push_approval: true' "$SCRIPT"
  grep -q 'require_code_owner_review: true' "$SCRIPT"
  grep -q 'required_review_thread_resolution: true' "$SCRIPT"
  grep -q 'required_approving_review_count: 1' "$SCRIPT"
}

@test "script is idempotent — fetches existing ruleset id and PUT/POST" {
  grep -q 'repos/$REPO/rulesets' "$SCRIPT"
  grep -qE '\-X PUT' "$SCRIPT"
  grep -qE '\-X POST' "$SCRIPT"
}
