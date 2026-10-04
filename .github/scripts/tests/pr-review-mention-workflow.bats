#!/usr/bin/env bats
# Tests for the `pr-review-mention` job in .github/workflows/agent-ingress.yml —
# static YAML assertions, no live API calls.
#
# Regression guard for issue #307: Copilot-triggered `pull_request_review_comment`
# events were terminating as `action_required` (approval-gated), inflating the
# workflow's failure rate. The fix is a job-level `if:` guard that skips
# Bot-typed senders. These tests also pin the constraints the stub's AGENTS
# header forbade changing (the `uses:` ref, triggers, and permissions block).
#
# The per-role pr-review-mention.yml stub was collapsed into agent-ingress.yml
# (ADR-0007, issue #506); the guards now apply to the ingress job.

WORKFLOW="$(cd "$(dirname "$BATS_TEST_FILENAME")/../../.." && pwd)/.github/workflows/agent-ingress.yml"

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
  [[ "$output" == *"github.event.sender.type != 'Bot'"* ]]
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
  run yq '.on.pull_request.types | contains(["review_requested"])' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "true" ]
}

@test "pr-review-mention job if: selects exactly its original subscription" {
  run yq '.jobs.pr-review-mention.if' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"github.event_name == 'pull_request' && github.event.action == 'review_requested'"* ]]
  [[ "$output" == *"github.event_name == 'issue_comment'"* ]]
  [[ "$output" == *"github.event_name == 'pull_request_review_comment'"* ]]
}

@test "job-level pull-requests: write permission is preserved" {
  run yq '.jobs.pr-review-mention.permissions.pull-requests' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "write" ]
}
