---
id: google-signin-1
story: 1.1
sprint: 2
assignee: arshyg
estimate_hours: 6
---

# Sign in with Google and keep the user signed in with a session

## Description

This task lets a student sign in to PocketWatch with their Google account and stay signed in across requests.

The goal is to create a user account from the Google profile, store the Google refresh token securely so later features can call Google Calendar on the user's behalf, and give the browser a session cookie that the API checks on protected routes.

The task covers the Google OAuth routes, saving users, encrypting the refresh token, getting fresh Google access tokens, creating and checking sessions, returning the signed-in user, and logging out. Connecting the frontend, redirecting a cancelled sign-in back to the login page, and signing out on all devices are outside its scope.

## Specs
- Add `GET /auth/google`, which redirects to Google's sign-in page and requests the `openid`, `email`, `profile`, and Google Calendar events scopes with offline access.
- Add `GET /auth/google/callback`, which Google redirects to after the user approves.
- On sign-in, create a user from the Google profile, or update the existing user with the same Google ID, so repeat sign-ins never create duplicate users.
- Encrypt the Google refresh token with AES-256-GCM using `TOKEN_ENCRYPTION_KEY` before saving it, and keep the stored token if Google does not send a new one.
- Add `AuthService.getAccessToken(userId)`, which uses the stored refresh token to get a fresh Google access token.
- After sign-in, create a session with a random 256-bit ID that expires after 7 days, set it in an httpOnly, SameSite=Lax `session` cookie, and redirect to `FRONTEND_URL`.
- Add `SessionGuard` and `@CurrentUser()` so routes can require a signed-in user.
- Add `GET /auth/me`, which returns the signed-in user's `id`, `email`, `name`, and `avatarUrl`.
- Add `POST /auth/logout`, which deletes the session and clears the cookie.
- Add the new environment variable names to `apps/api/.env.example`.

## Requirements

- Use Google OAuth 2.0 through `@nestjs/passport` and `passport-google-oauth20`.
- Never store the Google refresh token in plain text, and never return it from an API route.
- Session IDs must be random and unguessable.
- Expired sessions must not count as signed in.
- Do not commit secrets; real values belong in `apps/api/.env`.

## Acceptance criteria

1. `GET /auth/google` redirects to Google's sign-in page with the required scopes.
2. Signing in with the same Google account twice results in one user, not two.
3. The stored refresh token is encrypted, decrypts back to the original token with the right key, and cannot be decrypted with the wrong key or after being changed.
4. After sign-in, the browser receives an httpOnly `session` cookie and is redirected to `FRONTEND_URL`.
5. `GET /auth/me` returns 401 with no session cookie, an unknown session, or an expired session.
6. `GET /auth/me` returns the signed-in user, without the refresh token, when the session is valid.
7. `POST /auth/logout` returns 204, deletes the session, and clears the cookie, including when the user is already logged out.
