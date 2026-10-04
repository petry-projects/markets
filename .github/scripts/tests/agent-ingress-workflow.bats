#!/usr/bin/env bats
# Tests for .github/workflows/agent-ingress.yml — static YAML assertions, no live
# API calls.
#
# Regression guard for the ADR-0007 pilot collapse (issue #506): the 5 Class-1
# event-driven per-role caller stubs are replaced by ONE ingress with one thin
# caller job per role. Source of truth is the collapse package in
# petry-projects/.github-private docs/initiatives/agent-ingress-collapse-markets.md
# (§3 content, §2 eligible set + carve-outs, §4/ADR-0010 job-level concurrency).

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../../.." && pwd)"
WORKFLOWS="$REPO_ROOT/.github/workflows"
WORKFLOW="$WORKFLOWS/agent-ingress.yml"

ROLES=(dev-lead pr-auto-review pr-review pr-review-mention ci-failure-analyst)

@test "ingress workflow exists and is valid YAML" {
  [ -f "$WORKFLOW" ]
  yq '.' "$WORKFLOW" >/dev/null
}

@test "top-level permissions are empty" {
  run yq -o=json -I=0 '.permissions' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "{}" ]
}

@test "ingress carries exactly one job per collapsed role" {
  run yq '.jobs | keys | sort | join(",")' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "ci-failure-analyst,dev-lead,pr-auto-review,pr-review,pr-review-mention" ]
}

@test "every job is a thin caller with a reusable pin and an event-filter if:" {
  for role in "${ROLES[@]}"; do
    uses="$(yq ".jobs.\"$role\".uses" "$WORKFLOW")"
    cond="$(yq ".jobs.\"$role\".if" "$WORKFLOW")"
    [[ "$uses" == petry-projects/*/.github/workflows/*.yml@* ]] || { echo "$role: bad uses: $uses"; return 1; }
    [[ "$cond" == *"github.event_name"* ]] || { echo "$role: if: missing event filter"; return 1; }
    [ "$(yq ".jobs.\"$role\" | has(\"steps\")" "$WORKFLOW")" = "false" ] || { echo "$role: has steps"; return 1; }
  done
}

@test "legacy per-role stubs are removed" {
  for f in dev-lead pr-auto-review pr-review pr-review-mention ci-failure-analyst; do
    [ ! -e "$WORKFLOWS/$f.yml" ] || { echo "stale stub: $f.yml"; return 1; }
  done
}

@test "carve-out and required-gate stubs are kept (package §2b/§2c)" {
  for f in add-to-project dependabot-automerge dependabot-rebase auto-rebase \
           feature-ideation initiative-driver agent-shield dependency-audit; do
    [ -f "$WORKFLOWS/$f.yml" ] || { echo "missing carve-out: $f.yml"; return 1; }
  done
}

@test "on: is the union of the collapsed roles' triggers" {
  run yq '.on | keys | sort | join(",")' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "check_run,check_suite,issue_comment,issues,pull_request,pull_request_review,pull_request_review_comment,repository_dispatch,workflow_dispatch,workflow_run" ]
  run yq '.on.pull_request.types | sort | join(",")' "$WORKFLOW"
  [ "$output" = "opened,ready_for_review,reopened,review_requested,synchronize" ]
  run yq '.on.workflow_run.workflows | join(",")' "$WORKFLOW"
  [ "$output" = "CI" ]
  run yq '.on.repository_dispatch.types | sort | join(",")' "$WORKFLOW"
  [ "$output" = "dev-lead-ci-failure,dev-lead-issue-retry,dev-lead-reviews-retry,pr-review-mention" ]
}

@test "on: does not carry pull_request_target, push, or schedule" {
  for ev in pull_request_target push schedule; do
    [ "$(yq ".on | has(\"$ev\")" "$WORKFLOW")" = "false" ] || { echo "unexpected trigger: $ev"; return 1; }
  done
}

@test "each role keeps its pre-collapse pin (behavior parity)" {
  [[ "$(yq '.jobs.dev-lead.uses' "$WORKFLOW")" == *"/dev-lead-reusable.yml@dev-lead/v139-stable" ]]
  [ "$(yq '.jobs.dev-lead.with.agent_ref' "$WORKFLOW")" = "dev-lead/v139-stable" ]
  [[ "$(yq '.jobs.pr-auto-review.uses' "$WORKFLOW")" == *"/pr-auto-review-reusable.yml@pr-auto-review/v1-stable" ]]
  [[ "$(yq '.jobs.pr-review.uses' "$WORKFLOW")" == *"/pr-review.yml@pr-review/stable" ]]
  [ "$(yq '.jobs.pr-review.with.agent_ref' "$WORKFLOW")" = "pr-review/stable" ]
  [[ "$(yq '.jobs.pr-review-mention.uses' "$WORKFLOW")" == *"/pr-review-mention-reusable.yml@pr-review-mention/v2-stable" ]]
  [[ "$(yq '.jobs.ci-failure-analyst.uses' "$WORKFLOW")" == *"/ci-failure-analyst-reusable.yml@79747178007d3238bb3afddf7f4d952a293987bd" ]]
}

@test "dev-lead job keeps the base=main PR filter and declares no caller concurrency" {
  run yq '.jobs.dev-lead.if' "$WORKFLOW"
  [[ "$output" == *"github.event.pull_request.base.ref == 'main'"* ]]
  # dev-lead centralises concurrency inside its reusable (ADR-0010 collision case).
  [ "$(yq '.jobs.dev-lead | has("concurrency")' "$WORKFLOW")" = "false" ]
}

@test "job-level concurrency groups are role-prefixed with literal cancel-in-progress (ADR-0010)" {
  for role in pr-auto-review pr-review ci-failure-analyst; do
    group="$(yq ".jobs.\"$role\".concurrency.group" "$WORKFLOW")"
    cancel="$(yq ".jobs.\"$role\".concurrency.cancel-in-progress | tag" "$WORKFLOW")"
    [[ "$group" == "$role-"* ]] || { echo "$role: group lacks role prefix: $group"; return 1; }
    # ADR-0010 forbids run_id and the inputs context (github.event.inputs.* is payload).
    payload_stripped="${group//github.event.inputs./}"
    [[ "$group" != *"run_id"* && "$payload_stripped" != *"inputs."* ]] \
      || { echo "$role: group reads run_id/inputs context"; return 1; }
    [ "$cancel" = "!!bool" ] || { echo "$role: cancel-in-progress not a literal bool"; return 1; }
  done
  [ "$(yq '.jobs.ci-failure-analyst.concurrency.cancel-in-progress' "$WORKFLOW")" = "false" ]
}

@test "pr-review concurrency fallback is 'enumerate', never the reusable's 'batch' group" {
  run yq '.jobs.pr-review.concurrency.group' "$WORKFLOW"
  [[ "$output" == *"'enumerate'"* ]]
  [[ "$output" != *"'batch'"* ]]
}

@test "pr-review job keeps the check_suite-with-no-PR skip" {
  run yq '.jobs.pr-review.if' "$WORKFLOW"
  [[ "$output" == *"github.event.check_suite.pull_requests[0] != null"* ]]
}

@test "ci-failure-analyst job skips non-failures and its own check run" {
  run yq '.jobs.ci-failure-analyst.if' "$WORKFLOW"
  [[ "$output" == *"github.event_name == 'check_run'"* ]]
  [[ "$output" == *"github.event.check_run.conclusion == 'failure'"* ]]
  [[ "$output" == *"!startsWith(github.event.check_run.name, 'CI Failure Analyst')"* ]]
}

@test "if: guards never read repo state (vars/secrets/needs/hashFiles)" {
  for role in "${ROLES[@]}"; do
    cond="$(yq ".jobs.\"$role\".if" "$WORKFLOW")"
    [[ "$cond" != *"vars."* && "$cond" != *"secrets."* && "$cond" != *"needs."* && "$cond" != *"hashFiles"* ]] \
      || { echo "$role: if: reaches repo state"; return 1; }
  done
}
