#!/usr/bin/env bats
# Tests for apply-pr-quality-ruleset.sh — static content assertions, no live API calls.
#
# The pull_request rule parameters asserted below are the codified standard
# (petry-projects/.github/standards/rulesets/pr-quality.json), the source of
# truth referenced by issue #323. require_code_owner_review is the parameter
# that drifted to false and must be codified as true.

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

@test "script requires GH_TOKEN" {
  grep -q 'GH_TOKEN' "$SCRIPT"
}

@test "script codifies require_code_owner_review as true (issue #323 drift)" {
  grep -qE 'require_code_owner_review:\s*true' "$SCRIPT"
}

@test "script codifies required_approving_review_count of 1" {
  grep -qE 'required_approving_review_count:\s*1' "$SCRIPT"
}

@test "script codifies required_review_thread_resolution as true" {
  grep -qE 'required_review_thread_resolution:\s*true' "$SCRIPT"
}

@test "script codifies dismiss_stale_reviews_on_push as true" {
  grep -qE 'dismiss_stale_reviews_on_push:\s*true' "$SCRIPT"
}

@test "script codifies require_last_push_approval as true" {
  grep -qE 'require_last_push_approval:\s*true' "$SCRIPT"
}

@test "script restricts allowed_merge_methods to squash" {
  grep -q 'allowed_merge_methods' "$SCRIPT"
  grep -q '"squash"' "$SCRIPT"
}

@test "script declares a pull_request rule type" {
  grep -q 'type: "pull_request"' "$SCRIPT"
}
