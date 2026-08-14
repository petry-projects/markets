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

# Regression guard for issue #420 (ruleset-drift-pr-quality-require_last_push_approval
# recurred after #403). The #403 schedule cannot self-heal drift because every run —
# including the scheduled one — fails immediately with "GH_TOKEN is required": the
# GH_TOKEN_ADMIN secret is not configured, and the failure was buried in the script
# log where nobody noticed. These tests pin a preflight step that surfaces the missing
# secret loudly (GitHub error annotation + job summary) with actionable remediation, so
# the operational blocker is discoverable instead of silently recurring.

@test "workflow has a preflight step that verifies GH_TOKEN_ADMIN before applying (issue #420)" {
  run yq '[.jobs["apply-settings"].steps[] | select(.env.GH_TOKEN_ADMIN != null and (.run | test("GH_TOKEN_ADMIN")))] | length' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" -ge 1 ]
}

@test "preflight step surfaces the missing secret loudly and actionably (issue #420)" {
  run yq '.jobs["apply-settings"].steps[] | select(.env.GH_TOKEN_ADMIN != null and (.run | test("GH_TOKEN_ADMIN"))) | .run' "$WORKFLOW"
  [ "$status" -eq 0 ]
  local preflight="$output"
  # emits a GitHub error annotation so the failure is visible on the run page
  printf '%s\n' "$preflight" | grep -q '::error'
  # writes actionable remediation to the job summary
  printf '%s\n' "$preflight" | grep -q 'GITHUB_STEP_SUMMARY'
  # fails the job so the drift is not silently left unhealed
  printf '%s\n' "$preflight" | grep -q 'exit 1'
}

@test "preflight runs before the apply-repo-settings step (issue #420)" {
  run yq '.jobs["apply-settings"].steps | to_entries | map(select(.value.env.GH_TOKEN_ADMIN != null and (.value.run | test("GH_TOKEN_ADMIN")))) | .[0].key' "$WORKFLOW"
  [ "$status" -eq 0 ]
  local preflight_idx="$output"

  run yq '.jobs["apply-settings"].steps | to_entries | map(select(.value.run | test("apply-repo-settings.sh"))) | .[0].key' "$WORKFLOW"
  [ "$status" -eq 0 ]
  local apply_idx="$output"

  [ -n "$preflight_idx" ] && [ "$preflight_idx" != "null" ]
  [ -n "$apply_idx" ] && [ "$apply_idx" != "null" ]
  [ "$preflight_idx" -lt "$apply_idx" ]
}
