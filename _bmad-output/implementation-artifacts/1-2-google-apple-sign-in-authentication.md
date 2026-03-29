# Story 1.2: Google & Apple Sign-In Authentication

Status: ready-for-dev

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

- [ ] Task 1: Firebase Auth configuration (AC: #1, #2)
  - [ ] 1.1 Configure Firebase project with Google Sign-In provider
  - [ ] 1.2 Configure Firebase project with Apple Sign-In provider
  - [ ] 1.3 Add `@react-native-firebase/auth` and `expo-auth-session` dependencies
  - [ ] 1.4 Create `lib/firebase.ts` with Firebase Auth initialization

- [ ] Task 2: Login screen UI (AC: #1, #2)
  - [ ] 2.1 Create `app/(auth)/login.tsx` login screen
  - [ ] 2.2 Add "Sign in with Google" button using Gluestack `<Button>` + `<ButtonText>` with `accessibilityLabel="Sign in with Google"`
  - [ ] 2.3 Add "Sign in with Apple" button using Gluestack `<Button>` + `<ButtonText>` with `accessibilityLabel="Sign in with Apple"`
  - [ ] 2.4 Add loading state indicator during OAuth flow (skeleton/loading, button disabled)
  - [ ] 2.5 Add user-friendly error message display on auth failure (not raw errors)

- [ ] Task 3: Firebase OAuth flow implementation (AC: #1, #2)
  - [ ] 3.1 Create `hooks/useAuth.ts` hook encapsulating sign-in logic
  - [ ] 3.2 Implement Google OAuth flow via Firebase Auth SDK
  - [ ] 3.3 Implement Apple OAuth flow via Firebase Auth SDK
  - [ ] 3.4 Extract Firebase JWT from successful authentication result

- [ ] Task 4: JWT storage in expo-secure-store (AC: #1, #2)
  - [ ] 4.1 Add `expo-secure-store` dependency
  - [ ] 4.2 Store Firebase JWT in expo-secure-store on successful sign-in (iOS Keychain / Android Keystore backed)
  - [ ] 4.3 Implement token retrieval for app launch (returning user flow)
  - [ ] 4.4 Implement token deletion for sign-out

- [ ] Task 5: Apollo Client auth header configuration (AC: #1)
  - [ ] 5.1 Update `lib/apollo.ts` to read JWT from expo-secure-store
  - [ ] 5.2 Configure Apollo Client `authLink` to attach `Authorization: Bearer <JWT>` header on all requests
  - [ ] 5.3 Handle token refresh / re-authentication when token expires

- [ ] Task 6: Go auth middleware - JWT validation (AC: #3, #4)
  - [ ] 6.1 Add `firebase.google.com/go/v4` dependency to Go module
  - [ ] 6.2 Create `internal/auth/middleware.go` with HTTP middleware that validates Firebase JWT via Firebase Admin SDK
  - [ ] 6.3 Create `internal/auth/claims.go` for custom claim parsing (uid, role extraction)
  - [ ] 6.4 Populate request context with extracted uid and role for downstream resolver access
  - [ ] 6.5 Set PostgreSQL session variables (`SET LOCAL app.actor_id`, `SET LOCAL app.actor_role`) per request for audit trigger consumption
  - [ ] 6.6 Return UNAUTHENTICATED GraphQL error code for invalid, expired, malformed, missing, or wrong-issuer JWTs

- [ ] Task 7: Error handling (AC: #4)
  - [ ] 7.1 Implement `gqlError()` helper in Go for structured GraphQL error responses with UNAUTHENTICATED code
  - [ ] 7.2 Frontend: handle Apollo `onError` for UNAUTHENTICATED responses (redirect to login)
  - [ ] 7.3 Frontend: display short, action-oriented error messages to users (never raw errors)

- [ ] Task 8: Tests (AC: #1, #2, #3, #4)
  - [ ] 8.1 Write Go unit tests for auth middleware (test cases 1.2.1 - 1.2.6)
  - [ ] 8.2 Write Go integration test for session variable population (test case 1.2.7)
  - [ ] 8.3 Write React Native component tests for login screen rendering (test cases 1.2.8, 1.2.9)
  - [ ] 8.4 Write React Native hook unit tests for token storage and Apollo config (test cases 1.2.10, 1.2.11)
  - [ ] 8.5 Write React Native component tests for error and loading states (test cases 1.2.12, 1.2.13)

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
- `api/internal/auth/middleware.go` - Firebase JWT validation, context injection
- `api/internal/auth/middleware_test.go` - Unit tests (1.2.1-1.2.6)
- `api/internal/auth/claims.go` - Custom claim parsing (role extraction)
- `api/internal/auth/claims_test.go` - Claim parsing tests
- `api/cmd/api/main.go` - Wire auth middleware into HTTP chain

**Frontend files to create/modify:**
- `app/(auth)/login.tsx` - Login screen with Google + Apple sign-in buttons
- `lib/firebase.ts` - Firebase Auth initialization and configuration
- `lib/apollo.ts` - Apollo Client with auth link (Bearer header)
- `hooks/useAuth.ts` - Sign-in/sign-out hook encapsulating auth logic

**Shared schema:**
- `schema/auth.graphqls` - Auth-related GraphQL types (if needed for this story)

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

<!-- To be filled by implementing agent -->

### Debug Log References

### Completion Notes List

### File List
