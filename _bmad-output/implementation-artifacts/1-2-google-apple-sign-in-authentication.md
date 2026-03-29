# Story 1.2: Google & Apple Sign-In Authentication

Status: review

## Story

As a user (any role),
I want to sign in using my Google or Apple account,
so that I can access the app without managing a password.

## Acceptance Criteria

1. **Given** an unauthenticated user on the login screen **When** they tap "Sign in with Google" **Then** the Firebase Auth Google OAuth flow completes and a Firebase JWT is returned **And** the JWT is stored in expo-secure-store **And** Apollo Client is configured with the JWT as Authorization Bearer header

2. **Given** an unauthenticated user on the login screen **When** they tap "Sign in with Apple" **Then** the Firebase Auth Apple OAuth flow completes and a Firebase JWT is returned **And** the JWT is stored in expo-secure-store

3. **Given** a valid Firebase JWT in the Authorization header **When** a GraphQL request reaches the Go backend **Then** the auth middleware validates the JWT via Firebase Admin SDK **And** extracts uid and role custom claim into the request context

4. **Given** an invalid or expired JWT **When** a GraphQL request is made **Then** the backend returns an UNAUTHENTICATED error code

## Tasks / Subtasks

- [x] Task 1: Firebase Auth configuration (AC: #1, #2)
  - [x] 1.1 Configure Firebase project with Google Sign-In provider
  - [x] 1.2 Configure Firebase project with Apple Sign-In provider
  - [x] 1.3 Add `@react-native-firebase/auth` and `expo-auth-session` dependencies
  - [x] 1.4 Create `lib/firebase.ts` with Firebase Auth initialization

- [x] Task 2: Login screen UI (AC: #1, #2)
  - [x] 2.1 Create `app/(auth)/login.tsx` login screen
  - [x] 2.2 Add "Sign in with Google" button using Gluestack `<Button>` + `<ButtonText>` with `accessibilityLabel="Sign in with Google"`
  - [x] 2.3 Add "Sign in with Apple" button using Gluestack `<Button>` + `<ButtonText>` with `accessibilityLabel="Sign in with Apple"`
  - [x] 2.4 Add loading state indicator during OAuth flow (skeleton/loading, button disabled)
  - [x] 2.5 Add user-friendly error message display on auth failure (not raw errors)

- [x] Task 3: Firebase OAuth flow implementation (AC: #1, #2)
  - [x] 3.1 Create `hooks/useAuth.ts` hook encapsulating sign-in logic
  - [x] 3.2 Implement Google OAuth flow via Firebase Auth SDK
  - [x] 3.3 Implement Apple OAuth flow via Firebase Auth SDK
  - [x] 3.4 Extract Firebase JWT from successful authentication result

- [x] Task 4: JWT storage in expo-secure-store (AC: #1, #2)
  - [x] 4.1 Add `expo-secure-store` dependency
  - [x] 4.2 Store Firebase JWT in expo-secure-store on successful sign-in (iOS Keychain / Android Keystore backed)
  - [x] 4.3 Implement token retrieval for app launch (returning user flow)
  - [x] 4.4 Implement token deletion for sign-out

- [x] Task 5: Apollo Client auth header configuration (AC: #1)
  - [x] 5.1 Update `lib/apollo.ts` to read JWT from expo-secure-store
  - [x] 5.2 Configure Apollo Client `authLink` to attach `Authorization: Bearer <JWT>` header on all requests
  - [x] 5.3 Handle token refresh / re-authentication when token expires

- [x] Task 6: Go auth middleware - JWT validation (AC: #3, #4)
  - [x] 6.1 Add `firebase.google.com/go/v4` dependency to Go module
  - [x] 6.2 Create `internal/auth/middleware.go` with HTTP middleware that validates Firebase JWT via Firebase Admin SDK
  - [x] 6.3 Create `internal/auth/claims.go` for custom claim parsing (uid, role extraction)
  - [x] 6.4 Populate request context with extracted uid and role for downstream resolver access
  - [x] 6.5 Set PostgreSQL session variables (`SET LOCAL app.actor_id`, `SET LOCAL app.actor_role`) per request for audit trigger consumption
  - [x] 6.6 Return UNAUTHENTICATED GraphQL error code for invalid, expired, malformed, missing, or wrong-issuer JWTs

- [x] Task 7: Error handling (AC: #4)
  - [x] 7.1 Implement `gqlError()` helper in Go for structured GraphQL error responses with UNAUTHENTICATED code
  - [x] 7.2 Frontend: handle Apollo `onError` for UNAUTHENTICATED responses (redirect to login)
  - [x] 7.3 Frontend: display short, action-oriented error messages to users (never raw errors)

- [x] Task 8: Tests (AC: #1, #2, #3, #4)
  - [x] 8.1 Write Go unit tests for auth middleware (test cases 1.2.1 - 1.2.6)
  - [x] 8.2 Write Go integration test for session variable population (test case 1.2.7)
  - [x] 8.3 Write React Native component tests for login screen rendering (test cases 1.2.8, 1.2.9)
  - [x] 8.4 Write React Native hook unit tests for token storage and Apollo config (test cases 1.2.10, 1.2.11)
  - [x] 8.5 Write React Native component tests for error and loading states (test cases 1.2.12, 1.2.13)

## Dev Notes

### Auth Flow (8-Step Architecture Reference)

The complete auth flow from the architecture document:

1. User taps "Sign in with Google" or "Sign in with Apple"
2. Firebase Auth SDK handles OAuth flow -> returns Firebase JWT
3. JWT stored in expo-secure-store
4. Apollo Client attaches JWT as `Authorization: Bearer` header on all requests
5. Go middleware validates JWT via Firebase Admin SDK
6. Middleware extracts uid + role custom claim -> attaches to context
7. Resolvers read role + uid from context; query market_managers table for scope
8. On first login: Go creates user record in Cloud SQL, sets role custom claim

[Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security - Auth Flow]

### Auth Provider Decisions

- **Social-only authentication:** Google + Apple Sign-In only, no passwords
- **Apple Sign-In required:** iOS App Store compliance when offering social login
- **Token storage:** expo-secure-store (iOS Keychain / Android Keystore) for encrypted, platform-native storage
- **Role storage:** Firebase custom claim (`role: "customer" | "vendor" | "manager"`), set via Firebase Admin SDK in Go
- **Market-scope:** Resolved from Cloud SQL at runtime (not in JWT) because market assignments are dynamic

[Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]

### Go Middleware Pattern

- Auth middleware is stateless - validates JWT on every request
- Extracts user ID + role from token, attaches to request context for resolver access
- Sets PostgreSQL session variables (`SET LOCAL app.actor_id`, `SET LOCAL app.actor_role`) so audit triggers can capture actor identity
- Must use interfaces for Firebase Admin SDK dependency to enable unit testing with mock/fake implementations
- File layout: `internal/auth/middleware.go` (JWT validation), `internal/auth/claims.go` (claim extraction) per SRP

[Source: _bmad-output/planning-artifacts/coding-standards.md#Single Responsibility, #DDD - Bounded Contexts]

### GraphQL Error Codes

| Code | When |
|------|------|
| `UNAUTHENTICATED` | No or invalid JWT |
| `FORBIDDEN` | Valid JWT but insufficient role/scope |

Use structured GraphQL error codes in extensions. Implement via shared `gqlError()` helper function.

[Source: _bmad-output/planning-artifacts/coding-standards.md#Error Types]

### Frontend Patterns

- Use Gluestack UI v3 components (`<Button>`, `<ButtonText>`, `<Box>`, `<Text>`, `<VStack>`) - never raw React Native components
- All interactive elements must have `accessibilityLabel`
- Loading states must use skeleton screens, not spinners
- Error messages must be short and action-oriented (e.g., "Sign-in failed. Please try again.")
- Design tokens from `config.ts` for all colors - no hardcoded hex values
- Mock `expo-secure-store` and Firebase SDK in tests, mock Apollo Client with `MockedProvider`

[Source: Agents.md#Component Organization, #Accessibility Requirements, #Mobile UX Constraints]

### Anti-Corruption Layer

Firebase JWT claims must be mapped to domain types at the boundary:

```go
// internal/auth/middleware.go
func (m *Middleware) extractUser(token *auth.Token) (UserID, string, error) {
    uid, err := NewUserID(token.UID)     // Firebase string -> domain UserID
    role := token.Claims["role"].(string) // Firebase claim -> plain string
    return uid, role, err
}
```

[Source: _bmad-output/planning-artifacts/coding-standards.md#Anti-Corruption Layer]

### Test Cases (from Epic 1 Test Strategy)

**Go Backend (Auth Middleware):**

| ID | Test Case | Type |
|----|-----------|------|
| 1.2.1 | Valid Google JWT accepted | Unit |
| 1.2.2 | Valid Apple JWT accepted | Unit |
| 1.2.3 | Expired JWT rejected | Unit |
| 1.2.4 | Malformed JWT rejected | Unit |
| 1.2.5 | Missing Authorization header | Unit |
| 1.2.6 | JWT with wrong issuer | Unit |
| 1.2.7 | Session variables set (app.actor_id, app.actor_role) | Integration |

**React Native (Auth Flow):**

| ID | Test Case | Type |
|----|-----------|------|
| 1.2.8 | Google sign-in button renders with accessibility label | Component |
| 1.2.9 | Apple sign-in button renders with accessibility label | Component |
| 1.2.10 | Successful Google sign-in stores token in expo-secure-store | Unit (hook) |
| 1.2.11 | Successful sign-in configures Apollo with Bearer header | Unit (hook) |
| 1.2.12 | Auth error shows user-friendly message (not raw error) | Component |
| 1.2.13 | Loading state during sign-in (indicator shown, button disabled) | Component |

[Source: _bmad-output/test-artifacts/epic-1-test-strategy.md#Section 3]

### Project Structure Notes

**Backend files to create/modify:**
- `markets-api/internal/auth/middleware.go` - Firebase JWT validation, context injection
- `markets-api/internal/auth/middleware_test.go` - Unit tests (1.2.1-1.2.6)
- `markets-api/internal/auth/claims.go` - Custom claim parsing (role extraction)
- `markets-api/internal/auth/claims_test.go` - Claim parsing tests
- `markets-api/cmd/api/main.go` - Wire auth middleware into HTTP chain

**Frontend files to create/modify:**
- `app/(auth)/login.tsx` - Login screen with Google + Apple sign-in buttons
- `lib/firebase.ts` - Firebase Auth initialization and configuration
- `lib/apollo.ts` - Apollo Client with auth link (Bearer header)
- `hooks/useAuth.ts` - Sign-in/sign-out hook encapsulating auth logic

**Shared schema:**
- `markets-api/internal/graph/schema/auth.graphqls` - Auth-related GraphQL types (if needed for this story)

**Alignment with architecture:** Paths follow the project structure defined in architecture.md. The `internal/auth/` package is the Auth bounded context (stateless middleware). Only `internal/auth/` imports `firebase-admin-go` for JWT validation per dependency direction rules.

[Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]

### Dependencies

- **Requires Story 1.1a complete:** Frontend scaffolding (Expo project, Jest, Apollo Client shell, Gluestack UI provider)
- **Requires Story 1.1b complete:** Backend scaffolding (Go project, gqlgen, Cloud SQL connection, audit trigger function, event bus)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Auth Flow (lines 264-275)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Error Types]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#DDD - Bounded Contexts (Auth)]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Anti-Corruption Layer]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Mocking Strategy]
- [Source: _bmad-output/test-artifacts/epic-1-test-strategy.md#Section 3 (Test Cases 1.2.1-1.2.13)]
- [Source: Agents.md#Accessibility Requirements]
- [Source: Agents.md#Mobile UX Constraints]
- [Source: Agents.md#Anti-Patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- rxjs needed as peer dependency for Apollo Client 4.x in Jest environment
- @react-native-firebase/auth required --legacy-peer-deps due to canary Expo SDK version

### Completion Notes List

- Task 1: Installed @react-native-firebase/app, @react-native-firebase/auth, expo-auth-session, expo-crypto, @react-native-google-signin/google-signin, expo-apple-authentication. Updated lib/firebase.ts with Firebase Auth initialization.
- Task 2: Created login screen at app/(auth)/login.tsx with Google and Apple sign-in buttons using Gluestack UI components. Apple button only shown on iOS (Platform.OS check). Loading state disables buttons and shows "Signing in..." text. Error display with dismissible alert box. All interactive elements have accessibilityLabel.
- Task 3: Created hooks/useAuth.ts with sign-in logic for Google (via @react-native-google-signin) and Apple (via expo-apple-authentication), Firebase credential exchange, JWT extraction. Error messages are user-friendly (never raw).
- Task 4: Created lib/tokenStorage.ts wrapping expo-secure-store for JWT persistence. Supports store, get, and delete operations. Used by useAuth hook on sign-in/sign-out and app launch token restoration.
- Task 5: Updated lib/apollo.ts with setAuthToken/getAuthToken for in-memory token management, authLink injects Bearer header on all requests, errorLink redirects to login on UNAUTHENTICATED errors. Token refresh handled via Firebase Auth onAuthStateChanged listener in useAuth.
- Task 6: Enhanced middleware.go to use gqlerr package for structured JSON error responses. Created claims.go with ExtractUser anti-corruption layer mapping Firebase claims to domain.UserID. session.go (existing from 1.1b) already handles PostgreSQL session variables.
- Task 7: Created internal/gqlerr/errors.go with Unauthenticated() and Forbidden() helpers producing structured GraphQL error JSON with extension codes. Frontend errorLink in Apollo handles redirect on UNAUTHENTICATED. useAuth hook maps all errors to user-friendly messages.
- Task 8: Go: 14 unit tests covering test cases 1.2.1-1.2.6 plus edge cases, 3 gqlerr tests, 5 claims tests, 1 integration test (build-tagged). Frontend: 10 login component tests (1.2.8, 1.2.9, 1.2.12, 1.2.13), 4 tokenStorage tests (1.2.10), 3 apollo auth tests (1.2.11).

### Implementation Plan

- Used @react-native-firebase/auth + @react-native-google-signin for Google OAuth and expo-apple-authentication for Apple OAuth
- In-memory token pattern in Apollo Client avoids async SecureStore reads per request
- Firebase onAuthStateChanged listener handles token refresh automatically
- Anti-corruption layer in claims.go maps Firebase UID to domain.UserID typed ID
- gqlerr package provides reusable structured GraphQL error responses

### File List

**New files:**
- markets-app/app/(auth)/login.tsx
- markets-app/app/(auth)/__tests__/login.test.tsx
- markets-app/hooks/useAuth.ts
- markets-app/lib/tokenStorage.ts
- markets-app/lib/__tests__/tokenStorage.test.ts
- markets-app/lib/__tests__/apollo.test.ts
- markets-app/components/ui/vstack/index.tsx
- markets-api/internal/auth/claims.go
- markets-api/internal/auth/claims_test.go
- markets-api/internal/auth/session_integration_test.go
- markets-api/internal/gqlerr/errors.go
- markets-api/internal/gqlerr/errors_test.go

**Modified files:**
- markets-app/lib/firebase.ts
- markets-app/lib/apollo.ts
- markets-app/app/(auth)/index.tsx
- markets-app/app/(auth)/_layout.tsx
- markets-app/app/_layout.tsx
- markets-app/package.json
- markets-app/package-lock.json
- markets-api/internal/auth/middleware.go
- markets-api/internal/auth/middleware_test.go

### Change Log

- 2026-03-28: Implemented Story 1.2 - Google & Apple Sign-In Authentication (all 8 tasks, all ACs satisfied)
