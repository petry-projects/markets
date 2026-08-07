#!/usr/bin/env bats
# Tests for .github/workflows/apply-repo-settings.yml — static YAML assertions,
# no live API calls.
#
# Regression guard for issue #403 (ruleset-drift-pr-quality-require_last_push_approval):
# the codified pr-quality ruleset already sets require_last_push_approval: true, but the
# live ruleset kept drifting back to false because apply-repo-settings.yml only re-applied
# the codified standard on manual dispatch or on a push touching the ruleset scripts.
# A scheduled trigger makes the codified rulesets self-heal drift automatically. These
# tests pin that the schedule trigger exists and that the pre-existing triggers survive.

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

@test "workflow preserves the push trigger on main touching the ruleset scripts" {
  run yq '.on.push.branches[0]' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "main" ]

  run yq '.on.push.paths | contains([".github/scripts/apply-pr-quality-ruleset.sh"])' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" = "true" ]
}
