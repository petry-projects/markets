#!/usr/bin/env bats
# Tests for apply-pr-quality-ruleset.sh
#
# Static checks verify the script's safety settings and target repo.
# The payload test mocks the gh CLI to capture the actual JSON sent to the
# GitHub API and uses jq to assert structure and values — avoids fragile
# grep-on-source-file assertions.

SCRIPT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/apply-pr-quality-ruleset.sh"

setup() {
  export BATS_TMPDIR="$(mktemp -d)"
  export GH_TOKEN="mock-token"
}

teardown() {
  rm -rf "$BATS_TMPDIR"
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

@test "script generates correct ruleset payload" {
  gh() {
    if [ "$1" = "api" ]; then
      if [ "$2" = "repos/petry-projects/markets/rulesets" ]; then
        echo ""
        return 0
      elif [ "$2" = "-X" ] && [ "$3" = "POST" ]; then
        cat > "$BATS_TMPDIR/payload.json"
        echo '{"id": 12345}'
        return 0
      fi
    fi
    command gh "$@"
  }
  export -f gh

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]

  [ "$(jq -r '.name' "$BATS_TMPDIR/payload.json")" = "pr-quality" ]
  [ "$(jq -r '.target' "$BATS_TMPDIR/payload.json")" = "branch" ]
  [ "$(jq -r '.enforcement' "$BATS_TMPDIR/payload.json")" = "active" ]
  [ "$(jq -r '.conditions.ref_name.include[0]' "$BATS_TMPDIR/payload.json")" = "~DEFAULT_BRANCH" ]
  [ "$(jq -r '.rules[0].type' "$BATS_TMPDIR/payload.json")" = "pull_request" ]

  local params=".rules[0].parameters"
  [ "$(jq -r "$params.required_approving_review_count" "$BATS_TMPDIR/payload.json")" -eq 1 ]
  [ "$(jq -r "$params.require_code_owner_review" "$BATS_TMPDIR/payload.json")" = "true" ]
  [ "$(jq -r "$params.required_review_thread_resolution" "$BATS_TMPDIR/payload.json")" = "true" ]
  [ "$(jq -r "$params.dismiss_stale_reviews_on_push" "$BATS_TMPDIR/payload.json")" = "true" ]
  [ "$(jq -r "$params.require_last_push_approval" "$BATS_TMPDIR/payload.json")" = "true" ]
  [ "$(jq -r "$params.allowed_merge_methods[0]" "$BATS_TMPDIR/payload.json")" = "squash" ]
}
