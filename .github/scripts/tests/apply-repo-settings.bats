#!/usr/bin/env bats
# Tests for apply-repo-settings.sh — static content assertions, no live API calls.

SCRIPT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/apply-repo-settings.sh"

@test "script exists and is executable" {
  [ -f "$SCRIPT" ]
  [ -x "$SCRIPT" ]
}

@test "script disables CodeRabbit (347564) auto-trigger" {
  grep -q '"app_id": 347564' "$SCRIPT"
  grep -qE '"app_id":\s*347564.*"setting":\s*false|"setting":\s*false.*"app_id":\s*347564' "$SCRIPT"
}

@test "script disables Claude (1236702) auto-trigger" {
  grep -q '1236702' "$SCRIPT"
  grep -qE '"app_id":\s*1236702.*"setting":\s*false|"setting":\s*false.*"app_id":\s*1236702' "$SCRIPT"
}

@test "script uses set -euo pipefail" {
  grep -q 'set -euo pipefail' "$SCRIPT"
}

@test "script targets petry-projects/markets repo" {
  grep -q 'petry-projects/markets' "$SCRIPT"
}

@test "script wires in secret_scanning_non_provider_patterns enablement (issue #227)" {
  grep -q 'apply-secret-scanning-non-provider-patterns.sh' "$SCRIPT"
}
