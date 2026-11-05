---
id: logout-all-1
story: 1.1
sprint: 2
assignee: jenitasj
estimate_hours: 3
---

# Sign out a user from all PocketWatch devices

## Description

Serves story 1.1 by allowing an authenticated user to invalidate all
their PocketWatch sessions through one backend request.

Includes session deletion, a protected endpoint, cookie clearing, and
automated HTTP tests. A frontend button, Google token revocation,
database schema changes, and concurrent sign-in handling are out of scope.

## Specs

- Add POST /auth/logout-all in apps/api/src/auth/auth.controller.ts.
- Protect the endpoint with the existing SessionGuard.
- Obtain the authenticated user through CurrentUser.
- Add AuthService.deleteAllSessions(userId) in
  apps/api/src/auth/auth.service.ts.
- Delete all Session records belonging to that user.
- Return HTTP 204 with an empty response body.
- Clear the session cookie using the existing logout cookie options.
- Previously valid deleted sessions must return HTTP 401 from GET /auth/me.
- Sessions belonging to other users must remain valid.
- Missing, invalid, or expired sessions must receive HTTP 401 from
  POST /auth/logout-all without deleting valid sessions.
- Preserve the existing single-session POST /auth/logout behavior.
- Add automated tests in apps/api/tests/logout-all.test.mjs using
  Node's built-in test runner.
- Tests must run the real controller, guard, and auth service over HTTP,
  with an isolated in-memory substitute for Prisma.
- Add a backend test script so tests run with
  pnpm --filter @pocket-watch/api test.
- The test script must build the backend before testing compiled code.
- Every test name must start with "3 ".

## Requirements

- Reuse AuthService, SessionGuard, CurrentUser, and the Session model.
- Determine the target user from the authenticated session, not a
  request body or query parameter.
- Do not change the database schema or add runtime dependencies.
- Do not revoke Google access or modify stored Google refresh tokens.
- Do not expose session IDs or tokens in response bodies or logs.
- Preserve cookie settings: Path=/, HttpOnly, SameSite=Lax, and Secure
  in production.
- Existing backend typecheck and build must continue to pass.

## Acceptance criteria

1. An authenticated POST /auth/logout-all returns HTTP 204 with an empty body.
2. After logout-all, two previously valid sessions for the authenticated
   user both receive HTTP 401 from GET /auth/me.
3. Another user's valid session continues to receive HTTP 200 from GET /auth/me.
4. Missing, invalid, and expired session cookies receive HTTP 401 from
   POST /auth/logout-all and do not invalidate existing valid sessions.
5. Successful logout-all expires the current session cookie with
   Path=/, HttpOnly, SameSite=Lax, and Secure in production.
6. A user cannot choose another account to sign out by supplying a
   userId in the request body or query.
7. POST /auth/logout continues to invalidate only the current session,
   leaving another session for the same user valid.
