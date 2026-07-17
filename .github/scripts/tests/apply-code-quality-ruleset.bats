#!/usr/bin/env bats
# Tests for apply-code-quality-ruleset.sh — static content assertions, no live API calls.
#
# The required status check contexts asserted below are the codified standard
# (petry-projects/.github standards/rulesets/code-quality.json), the source of
# truth referenced by issue #326.

SCRIPT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/apply-code-quality-ruleset.sh"

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

@test "script declares the code-quality ruleset" {
  grep -q 'name: "code-quality"' "$SCRIPT"
}

@test "script requires the CodeQL status check" {
  grep -qF '{context: "CodeQL"}' "$SCRIPT"
}

@test "script requires the SonarCloud status check" {
  grep -qF '{context: "SonarCloud"}' "$SCRIPT"
}

@test "script requires the agent-shield / AgentShield status check" {
  grep -qF '{context: "agent-shield / AgentShield"}' "$SCRIPT"
}

@test "script requires the dependency-audit / Detect ecosystems status check" {
  grep -qF '{context: "dependency-audit / Detect ecosystems"}' "$SCRIPT"
}
