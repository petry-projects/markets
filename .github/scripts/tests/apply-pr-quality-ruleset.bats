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

@test "script requires GH_TOKEN" {
  grep -q 'GH_TOKEN' "$SCRIPT"
}

@test "script manages the pr-quality ruleset" {
  grep -q 'pr-quality' "$SCRIPT"
}

@test "script configures a pull_request rule" {
  grep -q 'pull_request' "$SCRIPT"
}

@test "script sets require_code_owner_review to true (issue #323)" {
  grep -qE 'require_code_owner_review["[:space:]:]+true' "$SCRIPT"
}

@test "script codifies the remaining pr-quality parameters" {
  grep -q 'required_approving_review_count' "$SCRIPT"
  grep -q 'required_review_thread_resolution' "$SCRIPT"
  grep -q 'dismiss_stale_reviews_on_push' "$SCRIPT"
  grep -q 'require_last_push_approval' "$SCRIPT"
}

@test "script is idempotent (creates or updates by existing id)" {
  grep -q 'repos/$REPO/rulesets' "$SCRIPT"
  grep -qE 'gh api -X (PUT|POST)' "$SCRIPT"
}
