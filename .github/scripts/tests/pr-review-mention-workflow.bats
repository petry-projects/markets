#!/usr/bin/env bats
# Tests for .github/workflows/pr-review-mention.yml — static YAML assertions,
# no live API calls.
#
# Regression guard for issue #307: Copilot-triggered `pull_request_review_comment`
# events were terminating as `action_required` (approval-gated), inflating the
# workflow's failure rate. The fix is a job-level `if:` guard that skips
# Bot-typed senders. These tests also pin the constraints the file's AGENTS
# header forbids changing (the `uses:` ref, triggers, and permissions block).

WORKFLOW="$(cd "$(dirname "$BATS_TEST_FILENAME")/../../.." && pwd)/.github/workflows/pr-review-mention.yml"

@test "workflow file exists" {
  [ -f "$WORKFLOW" ]
}

@test "workflow is valid YAML" {
  yq '.' "$WORKFLOW" >/dev/null
}

@test "pr-review-mention job skips Bot-typed senders (issue #307 fix)" {
  run yq '.jobs.pr-review-mention.if' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" != "null" ]
  [ -n "$output" ]
  # The guard must reference the sender type so Copilot/bot events are skipped.
  [[ "$output" == *"github.event.sender.type"* ]]
  [[ "$output" == *"Bot"* ]]
}

@test "uses: ref stays pinned to the pr-review-mention/v2-stable channel" {
  run yq '.jobs.pr-review-mention.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"@pr-review-mention/v2-stable" ]]
}

@test "trigger events are unchanged" {
  run yq '[.on | has("issue_comment"), .on | has("pull_request_review_comment"), .on | has("pull_request")] | all' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "true" ]
}

@test "job-level pull-requests: write permission is preserved" {
  run yq '.jobs.pr-review-mention.permissions.pull-requests' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "write" ]
}
