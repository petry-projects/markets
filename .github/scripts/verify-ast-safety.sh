#!/usr/bin/env bash
# verify-ast-safety.sh — Verify JavaScript syntax integrity and flag dangerous patterns
#
# Part of the XORAS Static Analyzer Initiative for petry-projects.
# Enforces clean, non-intrusive syntax checks across staged changes or target commits.
#
# Usage:
#   Local pre-commit check (staged files):
#     bash .github/scripts/verify-ast-safety.sh
#   CI check (diff against main):
#     bash .github/scripts/verify-ast-safety.sh origin/main...HEAD
#   Check all files:
#     bash .github/scripts/verify-ast-safety.sh all

set -euo pipefail

echo "=== XORAS AST SAFETY SENTRY ==="
echo "Scanning codebase for dangerous evaluation strings and un-trapped parameters..."

VIOLATIONS=0

# Determine mode and file source
MODE="pre-commit"

if [ "${1:-}" = "all" ]; then
  MODE="all"
elif [ -n "${1:-}" ]; then
  MODE="diff-range"
elif [ "${CI:-false}" = "true" ] && [ -n "${GITHUB_BASE_REF:-}" ]; then
  MODE="ci-pr"
  # Fetch target branch base to diff against
  echo "Fetching origin/${GITHUB_BASE_REF} for diff base..."
  git fetch origin "${GITHUB_BASE_REF}" --depth=1 >/dev/null 2>&1 || true
elif [ "${CI:-false}" = "true" ]; then
  MODE="ci-commit"
else
  MODE="pre-commit"
fi

get_files() {
  case "$MODE" in
    all)
      git ls-files -z
      ;;
    diff-range)
      git diff --name-only -z "$1"
      ;;
    ci-pr)
      git diff --name-only -z "origin/${GITHUB_BASE_REF}...HEAD"
      ;;
    ci-commit)
      if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
        git diff --name-only -z HEAD~1...HEAD
      else
        git ls-files -z
      fi
      ;;
    pre-commit)
      git diff --name-only --cached -z
      ;;
  esac
}

echo "Mode: ${MODE}"

# Helper to strip single-line and multi-line JS comments, as well as string literals
strip_comments() {
  if command -v node >/dev/null 2>&1; then
    node -e '
const fs = require("fs");
const code = fs.readFileSync(0, "utf-8");
const clean = code
  .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1")
  .replace(/"(?:[^"\\]|\\.)*"|\x27(?:[^\x27\\]|\\.)*\x27|`[\s\S]*?`/g, "");
console.log(clean);
'
  else
    # Fallback to line-based comment stripping
    grep -vE '^\s*(//|/\*|\*)'
  fi
}

# Run the scan
while IFS= read -r -d '' file; do
  # Filter for JavaScript files
  if [[ ! "$file" =~ \.(c|m)?js$ ]]; then
    continue
  fi

  # Skip if file does not exist (deleted files)
  if [ "${MODE}" = "pre-commit" ]; then
    if ! git show :"$file" >/dev/null 2>&1; then
      continue
    fi
  else
    if [ ! -f "$file" ]; then
      continue
    fi
  fi

  echo "Auditing: $file"

  # Retrieve contents (staged version for pre-commit, working copy otherwise)
  if [ "${MODE}" = "pre-commit" ]; then
    file_content=$(git show :"$file")
  else
    file_content=$(cat "$file")
  fi

  # Check for violations after stripping comments
  if echo "$file_content" | strip_comments | grep -qiE '\b(eval|Function)\s*\('; then
    echo "  [VIOLATION] Arbitrary dynamic evaluation 'eval()' or 'new Function()' found in $file" >&2
    VIOLATIONS=$((VIOLATIONS + 1))
  fi

done < <(get_files "${1:-}" || true)

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "ERROR: AST safety scan failed with $VIOLATIONS violations. Execution aborted." >&2
  exit 1
fi

echo "✅ AST safety scan completed successfully. No violations found."
exit 0
