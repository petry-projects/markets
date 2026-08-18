#!/usr/bin/env bats
# Tests for apply-code-quality-ruleset.sh — static content assertions, no live API calls.
#
# The required status check contexts asserted below are the codified standard
# (petry-projects/.github/standards/rulesets/code-quality.json), the source of
# truth referenced by issue #326.

SCRIPT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/apply-code-quality-ruleset.sh"


assert_required_check() {
  local context="$1"
  grep -qE "context:\s*\"$context\"" "$SCRIPT"
}

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
  assert_required_check "CodeQL"
}

@test "script requires the SonarCloud status check" {
  assert_required_check "SonarCloud"
}

@test "script requires the agent-shield / AgentShield status check" {
  assert_required_check "agent-shield / AgentShield"
}

@test "script requires the dependency-audit / Detect ecosystems status check" {
  assert_required_check "dependency-audit / Detect ecosystems"
}

@test "payload includes the OrganizationAdmin bypass actor with bypass_mode always" {
  export GH_TOKEN="mock-token"
  gh() {
    if [ "$1" = "api" ]; then
      if [ "$2" = "repos/petry-projects/markets/rulesets" ]; then
        echo ""
        return 0
      elif [ "$2" = "-X" ] && [ "$3" = "POST" ]; then
        cat > "$BATS_TEST_TMPDIR/payload.json"
        echo '{"id": 12345}'
        return 0
      fi
    fi
    command gh "$@"
  }
  export -f gh

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]

  jq -e '.bypass_actors == [{"actor_type":"OrganizationAdmin","bypass_mode":"always"},{"actor_id":3167543,"actor_type":"Integration","bypass_mode":"always"}]' "$BATS_TEST_TMPDIR/payload.json"
}

@test "update preserves existing bypass actors while ensuring OrganizationAdmin is present" {
  export GH_TOKEN="mock-token"
  gh() {
    if [ "$1" = "api" ]; then
      if [ "$2" = "repos/petry-projects/markets/rulesets" ]; then
        echo "999"
        return 0
      elif [ "$2" = "repos/petry-projects/markets/rulesets/999" ] && [ "$3" = "--jq" ]; then
        echo '[{"actor_type":"RepositoryRole","bypass_mode":"pull_request"}]'
        return 0
      elif [ "$2" = "-X" ] && [ "$3" = "PUT" ]; then
        cat > "$BATS_TEST_TMPDIR/payload.json"
        echo '{}'
        return 0
      fi
    fi
    command gh "$@"
  }
  export -f gh

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]

  jq -e '.bypass_actors == [{"actor_type":"RepositoryRole","bypass_mode":"pull_request"},{"actor_type":"OrganizationAdmin","bypass_mode":"always"},{"actor_id":3167543,"actor_type":"Integration","bypass_mode":"always"}]' "$BATS_TEST_TMPDIR/payload.json"
}
