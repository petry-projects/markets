#!/usr/bin/env bash
set -euo pipefail

API="${1:-https://markets-api-dev-471156433581.us-central1.run.app}"
FIREBASE_KEY="REDACTED_GOOGLE_API_KEY"
TS=$(date +%s)

echo "════════════════════════════════════════════"
echo "  E2E Smoke Test — $API"
echo "════════════════════════════════════════════"

echo ""
echo "1. Health Check"
curl -sf "$API/health"
echo ""

echo ""
echo "2. Create Firebase User (e2e-${TS}@test.dev)"
SIGNUP_FILE=$(mktemp)
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"e2e-${TS}@test.dev\",\"password\":\"TestPass123!\",\"returnSecureToken\":true}" \
  > "$SIGNUP_FILE"

TOKEN=$(python3 -c "import json; print(json.load(open('${SIGNUP_FILE}'))['idToken'])")
USER_ID=$(python3 -c "import json; print(json.load(open('${SIGNUP_FILE}'))['localId'])")
echo "  UID: $USER_ID"
echo "  Token: ${TOKEN:0:40}..."

echo ""
echo "3. createUser (role: MANAGER)"
curl -s -X POST "$API/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"query\":\"mutation { createUser(input: { role: MANAGER, name: \\\"E2E Manager\\\" }) { user { id firebaseUID email role } } }\"}" \
  | python3 -m json.tool

echo ""
echo "3b. Refresh token (to pick up role claim)"
REFRESH_TOKEN=$(python3 -c "import json; print(json.load(open('${SIGNUP_FILE}'))['refreshToken'])")
REFRESH_RESULT=$(mktemp)
curl -s -X POST "https://securetoken.googleapis.com/v1/token?key=${FIREBASE_KEY}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}" \
  > "$REFRESH_RESULT"
TOKEN=$(python3 -c "import json; print(json.load(open('${REFRESH_RESULT}'))['id_token'])")
echo "  Token refreshed: ${TOKEN:0:40}..."
rm -f "$REFRESH_RESULT"

echo ""
echo "4. createMarket"
curl -s -X POST "$API/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"query\":\"mutation { createMarket(input: { name: \\\"E2E Smoke Market\\\", address: \\\"123 Main St\\\", latitude: 40.7128, longitude: -74.006, contactEmail: \\\"mgr@test.dev\\\", recoveryContact: \\\"recovery@test.dev\\\" }) { id name address status } }\"}" \
  | python3 -m json.tool

echo ""
echo "5. myMarkets"
curl -s -X POST "$API/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ myMarkets { id name address status } }"}' \
  | python3 -m json.tool

echo ""
echo "6. Schema check"
curl -s -X POST "$API/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { queryType { fields { name } } mutationType { fields { name } } } }"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); q=len(d['data']['__schema']['queryType']['fields']); m=len(d['data']['__schema']['mutationType']['fields']); print(f'  {q} queries, {m} mutations')"

rm -f "$SIGNUP_FILE"
echo ""
echo "════════════════════════════════════════════"
echo "  SMOKE TEST COMPLETE"
echo "════════════════════════════════════════════"
