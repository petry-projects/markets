#!/usr/bin/env bats
# Tests for .github/workflows/apply-repo-settings.yml — static YAML assertions,
# no live API calls.
#
# This workflow is now a THIN CALLER STUB synced from the org source of truth
# (petry-projects/.github/standards/workflows/apply-repo-settings.yml). All
# settings/ruleset logic — including the #420 GH_TOKEN preflight guard — moved
# into the org reusable workflow (apply-repo-settings-reusable.yml); the consumer
# repo carries no script copy and the caller job has no steps. These tests were
# rewritten to pin the stub contract instead of the retired inline job.
#
# Regression guard for issue #403 (ruleset-drift-pr-quality-require_last_push_approval):
# a scheduled trigger makes the codified rulesets self-heal live drift automatically.
# The schedule/workflow_dispatch guards below survive the migration to the stub.

WORKFLOW="$(cd "$(dirname "$BATS_TEST_FILENAME")/../../.." && pwd)/.github/workflows/apply-repo-settings.yml"

@test "workflow file exists" {
  [ -f "$WORKFLOW" ]
}

@test "workflow is valid YAML" {
  yq '.' "$WORKFLOW" >/dev/null
}

@test "workflow declares a schedule trigger with a cron entry (issue #403 drift self-heal)" {
  run yq '.on.schedule | length' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" -ge 1 ]

  run yq '.on.schedule[0].cron' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" != "null" ]
  [ -n "$output" ]
}

@test "workflow preserves the workflow_dispatch trigger" {
  run yq '.on | has("workflow_dispatch")' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "true" ]
}

@test "workflow preserves the push trigger on main touching the stub itself" {
  run yq '.on.push.branches[0]' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "main" ]

  # The stub carries no script copy, so it re-applies on a push to its own file.
  run yq '.on.push.paths | contains([".github/workflows/apply-repo-settings.yml"])' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "true" ]
}

# Thin-caller-stub contract: the job delegates to the org reusable workflow and
# carries no inline steps of its own (settings/ruleset logic lives upstream).

@test "apply job delegates to the org reusable workflow via uses:" {
  run yq '.jobs.apply.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" != "null" ]
  printf '%s\n' "$output" | grep -q 'petry-projects/.github/.github/workflows/apply-repo-settings-reusable.yml@'
}

@test "apply job carries no inline steps (logic lives in the reusable)" {
  run yq '.jobs.apply | has("steps")' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "false" ]
}

@test "apply job inherits secrets so the reusable gets the admin token" {
  run yq '.jobs.apply.secrets' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "inherit" ]
}

@test "checkout_ref forward stays in lockstep with the uses: channel pin" {
  run yq '.jobs.apply.with.checkout_ref' "$WORKFLOW"
  [ "$status" -eq 0 ]
  local checkout_ref="$output"
  [ "$checkout_ref" != "null" ]
  [ -n "$checkout_ref" ]

  run yq '.jobs.apply.uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  local uses="$output"

  # `uses:` ends with @<channel-tag>; checkout_ref must equal that same tag.
  [ "${uses##*@}" = "$checkout_ref" ]
}
