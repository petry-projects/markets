#!/usr/bin/env bats
# Tests for apply-pr-quality-ruleset.sh — static content assertions, no live API calls.
#
# The pull_request rule parameters asserted below are the codified standard
# (petry-projects/.github/standards/rulesets/pr-quality.json), the source of
# truth referenced by issues #323 and #324. require_code_owner_review (#323)
# and dismiss_stale_reviews_on_push (#324) are the parameters that drifted to
# false and must be codified as true.

SCRIPT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/apply-pr-quality-ruleset.sh"

@test "script exists and is executable" {
  [ -f "$SCRIPT" ]
  [ -x "$SCRIPT" ]
}

@test "script uses set -euo pipefail" {
  grep -q 'set -euo pipefail' "$SCRIPT"
}

@test "script targets petry-projects/markets repo" {
  grep -qE '^REPO="petry-projects/markets"$' "$SCRIPT"
}

@test "script declares the pr-quality ruleset" {
  grep -qE 'RULESET_NAME\s*=\s*"pr-quality"' "$SCRIPT"
}

@test "script requires GH_TOKEN" {
  grep -q 'GH_TOKEN' "$SCRIPT"
}

@test "script sets dismiss_stale_reviews_on_push to true (issue #324)" {
  grep -qE '^[[:space:]]+dismiss_stale_reviews_on_push[[:space:]]*:[[:space:]]*true[[:space:]]*,?[[:space:]]*$' "$SCRIPT"
}

@test "script requires one approving review" {
  grep -qE '^[[:space:]]+required_approving_review_count[[:space:]]*:[[:space:]]*1[[:space:]]*,?[[:space:]]*$' "$SCRIPT"
}

@test "script requires code owner review (issue #323)" {
  grep -qE '^[[:space:]]+require_code_owner_review[[:space:]]*:[[:space:]]*true[[:space:]]*,?[[:space:]]*$' "$SCRIPT"
}

@test "script requires review thread resolution" {
  grep -qE '^[[:space:]]+required_review_thread_resolution[[:space:]]*:[[:space:]]*true[[:space:]]*,?[[:space:]]*$' "$SCRIPT"
}

@test "script requires last push approval" {
  grep -qE '^[[:space:]]+require_last_push_approval[[:space:]]*:[[:space:]]*true[[:space:]]*,?[[:space:]]*$' "$SCRIPT"
}

@test "script restricts allowed_merge_methods to squash" {
  grep -qE 'allowed_merge_methods:\s*\[\s*"squash"\s*\]' "$SCRIPT"
}

@test "script declares a pull_request rule type" {
  grep -qE 'type:\s*"pull_request"' "$SCRIPT"
}
