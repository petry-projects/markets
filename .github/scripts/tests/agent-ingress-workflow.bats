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
    run yq ".jobs.\"$role\".uses" "$WORKFLOW"
    [ "$status" -eq 0 ]
    uses="$output"
    run yq ".jobs.\"$role\".if" "$WORKFLOW"
    [ "$status" -eq 0 ]
    cond="$output"
    [[ "$uses" == petry-projects/*/.github/workflows/*.yml@* ]] || { printf '%s\n' "$role: bad uses: $uses"; return 1; }
    [[ "$cond" == *"github.event_name"* ]] || { printf '%s\n' "$role: if: missing event filter"; return 1; }
    run yq ".jobs.\"$role\" | has(\"steps\")" "$WORKFLOW"
    [ "$status" -eq 0 ]
    [ "$output" = "false" ] || { printf '%s\n' "$role: has steps"; return 1; }
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
    run yq ".on | has(\"$ev\")" "$WORKFLOW"
    [ "$status" -eq 0 ]
    [ "$output" = "false" ] || { printf '%s\n' "unexpected trigger: $ev"; return 1; }
  done
}

@test "each role keeps its pre-collapse pin (behavior parity)" {
  run yq '.jobs.dev-lead.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"/dev-lead-reusable.yml@dev-lead/v139-stable" ]]
  run yq '.jobs.dev-lead.with.agent_ref' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "dev-lead/v139-stable" ]
  run yq '.jobs.pr-auto-review.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"/pr-auto-review-reusable.yml@pr-auto-review/v1-stable" ]]
  run yq '.jobs.pr-review.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"/pr-review.yml@pr-review/stable" ]]
  run yq '.jobs.pr-review.with.agent_ref' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "pr-review/stable" ]
  run yq '.jobs.pr-review-mention.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"/pr-review-mention-reusable.yml@pr-review-mention/v2-stable" ]]
  run yq '.jobs.ci-failure-analyst.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"/ci-failure-analyst-reusable.yml@b58510275dd1cbbd13c0733c15265d51fd63b992" ]]
}

@test "dev-lead job keeps the base=main PR filter and declares no caller concurrency" {
  run yq '.jobs.dev-lead.if' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"github.event.pull_request.base.ref == 'main'"* ]]
  # dev-lead centralises concurrency inside its reusable (ADR-0010 collision case).
  run yq '.jobs.dev-lead | has("concurrency")' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "false" ]
}

@test "job-level concurrency groups are role-prefixed with literal cancel-in-progress (ADR-0010)" {
  for role in pr-auto-review pr-review ci-failure-analyst; do
    run yq ".jobs.\"$role\".concurrency.group" "$WORKFLOW"
    [ "$status" -eq 0 ]
    group="$output"
    run yq ".jobs.\"$role\".concurrency.cancel-in-progress | tag" "$WORKFLOW"
    [ "$status" -eq 0 ]
    cancel="$output"
    [[ "$group" == "$role-"* ]] || { printf '%s\n' "$role: group lacks role prefix: $group"; return 1; }
    # ADR-0010 forbids run_id and the inputs context (github.event.inputs.* is payload).
    payload_stripped="${group//github.event.inputs./}"
    [[ "$group" != *"run_id"* && "$payload_stripped" != *"inputs."* ]] \
      || { printf '%s\n' "$role: group reads run_id/inputs context"; return 1; }
    [ "$cancel" = "!!bool" ] || { printf '%s\n' "$role: cancel-in-progress not a literal bool"; return 1; }
  done
  run yq '.jobs.ci-failure-analyst.concurrency.cancel-in-progress' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "false" ]
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
    run yq ".jobs.\"$role\".if" "$WORKFLOW"
    [ "$status" -eq 0 ]
    cond="$output"
    [[ "$cond" != *"vars."* && "$cond" != *"secrets."* && "$cond" != *"needs."* && "$cond" != *"hashFiles"* ]] \
      || { printf '%s\n' "$role: if: reaches repo state"; return 1; }
  done
}
