#!/usr/bin/env bats
# Tests for apply-pr-quality-ruleset.sh — static content assertions, no live API calls.
#
# The pull_request rule parameters asserted below are the codified standard
# (petry-projects/.github/standards/rulesets/pr-quality.json), the source of
# truth referenced by issues #575/#580.

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

@test "script declares the pr-quality ruleset" {
  grep -q 'name: "pr-quality"' "$SCRIPT"
}

@test "script declares a pull_request rule" {
  grep -qE 'type:\s*"pull_request"' "$SCRIPT"
}

@test "script sets require_last_push_approval to true (issue #325)" {
  grep -qE 'require_last_push_approval:\s*true' "$SCRIPT"
}

@test "script requires 1 approving review" {
  grep -qE 'required_approving_review_count:\s*1' "$SCRIPT"
}

@test "script requires code owner review" {
  grep -qE 'require_code_owner_review:\s*true' "$SCRIPT"
}

@test "script requires review thread resolution" {
  grep -qE 'required_review_thread_resolution:\s*true' "$SCRIPT"
}

@test "script dismisses stale reviews on push" {
  grep -qE 'dismiss_stale_reviews_on_push:\s*true' "$SCRIPT"
}

@test "script restricts allowed merge methods to squash" {
  grep -qE 'allowed_merge_methods:\s*\["squash"\]' "$SCRIPT"
}
