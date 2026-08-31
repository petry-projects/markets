#!/usr/bin/env bats
# Tests for .github/workflows/shell-tests.yml — static YAML assertions,
# no live API calls.
#
# Regression guard for issue #447 (unpinned-actions-shell-tests.yml): the
# action-pinning standard requires every third-party action `uses:` ref to be
# pinned to a full commit SHA, not a moving `@vN` tag. shell-tests.yml checked
# out with `actions/checkout@v7`. These tests pin that the checkout step stays
# on a 40-char commit SHA so a future edit reverting to a floating tag is caught.

WORKFLOW="$(cd "$(dirname "$BATS_TEST_FILENAME")/../../.." && pwd)/.github/workflows/shell-tests.yml"

@test "workflow file exists" {
  [ -f "$WORKFLOW" ]
}

@test "workflow is valid YAML" {
  yq '.' "$WORKFLOW" >/dev/null
}

@test "every action uses: ref is pinned to a full commit SHA (issue #447)" {
  # Each `uses` must be owner/repo@<40-hex-sha>; a floating @vN tag fails this.
  run yq -r '.jobs[].steps[] | select(has("uses")) | .uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ -n "$output" ]
  while IFS= read -r ref; do
    [ -n "$ref" ] || continue
    [[ "$ref" =~ @[0-9a-f]{40}$ ]]
  done <<< "$output"
}

@test "checkout step is pinned to a SHA, not a moving tag (issue #447)" {
  run yq -r '.jobs.bats.steps[] | select((.uses // "") | test("^actions/checkout@")) | .uses' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ -n "$output" ]
  [[ "$output" =~ ^actions/checkout@[0-9a-f]{40}$ ]]
}
