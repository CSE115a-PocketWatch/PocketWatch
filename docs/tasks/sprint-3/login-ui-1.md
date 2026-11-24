---
id: login-ui-1
story: 2.1
sprint: 3
assignee: prithika-venkatesh
estimate_hours: 5
---

# Build the login page and sign-out UI

## Description

Serves story 2.1 by giving students a Google-only login page and a way
to sign out, built from the Figma design.

Includes the login page, sign-out button, shared design tokens, the API
rewrite to the backend, and test setup. The backend OAuth flow and
session handling are out of scope.

## Specs

- Enable Tailwind in apps/web/src/app/global.css.
- Load Nata Sans via next/font/google.
- Add the Version 1 color tokens in @theme.
- Add a /login page using AuthCard and GoogleButton components.
- GoogleButton links to /api/auth/google.
- Show an error banner when the URL contains ?error=<code>.
- Add a SignOutButton that sends POST /api/auth/logout and then
  redirects to /login.
- Add a rewrite in apps/web/next.config.ts that forwards /api/* to
  the backend.
- Mock next/navigation in apps/web/vitest.setup.ts so components that
  use useRouter can render in tests.

## Requirements

- Sign-in is Google only (no email/password fields).
- Use the shared color and font tokens rather than hard-coded values.
- Do not change backend authentication or database models.
- Existing web tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. /login renders the AuthCard with a Continue with Google button.
2. The Google button points to /api/auth/google.
3. Visiting /login?error=access_denied shows an error banner.
4. The Sign out button sends POST /api/auth/logout and redirects to /login.
5. /api/* requests are forwarded to the backend.
6. The home page test passes with the mocked router.
7. Web tests, typecheck, and build pass.