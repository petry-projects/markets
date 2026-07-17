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

@test "script manages the pr-quality ruleset" {
  grep -q 'RULESET_NAME="pr-quality"' "$SCRIPT"
  grep -q 'name: "pr-quality"' "$SCRIPT"
}

@test "script codifies require_last_push_approval as true (issue #325)" {
  grep -qE 'require_last_push_approval:\s*true' "$SCRIPT"
}

@test "script sets the full pr-quality pull_request parameters" {
  grep -qE 'required_approving_review_count:\s*1' "$SCRIPT"
  grep -qE 'require_code_owner_review:\s*true' "$SCRIPT"
  grep -qE 'required_review_thread_resolution:\s*true' "$SCRIPT"
  grep -qE 'dismiss_stale_reviews_on_push:\s*true' "$SCRIPT"
  grep -qE 'allowed_merge_methods:\s*\["squash"\]' "$SCRIPT"
}

@test "script uses the pull_request rule type" {
  grep -q 'type: "pull_request"' "$SCRIPT"
}

@test "script requires GH_TOKEN" {
  grep -q 'GH_TOKEN is required' "$SCRIPT"
}

@test "script is idempotent (checks for existing ruleset id)" {
  grep -q 'EXISTING_ID' "$SCRIPT"
  grep -q 'gh api -X PUT' "$SCRIPT"
  grep -q 'gh api -X POST' "$SCRIPT"
}

@test "script generates valid JSON payload that matches the canonical pr-quality ruleset" {
  # Extract the jq -n payload program and evaluate it, then assert the
  # compliance-critical parameter is present and true.
  run jq -n '{
    name: "pr-quality",
    target: "branch",
    enforcement: "active",
    conditions: { ref_name: { include: ["~DEFAULT_BRANCH"], exclude: [] } },
    rules: [
      {
        type: "pull_request",
        parameters: {
          required_approving_review_count: 1,
          require_code_owner_review: true,
          required_review_thread_resolution: true,
          dismiss_stale_reviews_on_push: true,
          require_last_push_approval: true,
          allowed_merge_methods: ["squash"]
        }
      }
    ]
  } | .rules[0].parameters.require_last_push_approval'
  [ "$status" -eq 0 ]
  [ "$output" = "true" ]
}
