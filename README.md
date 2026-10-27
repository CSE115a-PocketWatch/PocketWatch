
# PocketWatch

PocketWatch is a web application that helps students organize assignments, manage study availability, and plan study sessions around their schedules.

The goal is to integrate with Google Calendar so students can review and export study sessions alongside their existing commitments.

## Project Status

PocketWatch is currently in active development.

### Implemented

- pnpm monorepo configuration
- Next.js frontend with React and TypeScript
- NestJS backend with TypeScript
- Frontend and backend development servers
- ESLint and Prettier configuration
- Initial GitHub Actions CI configuration
- GitHub branch protection with required backend status checks

### Planned

- User authentication
- Assignment and deadline management
- Study availability preferences
- Automatic study-session generation
- Schedule preview and manual editing
- Google Calendar OAuth 2.0 integration
- Google Calendar event synchronization
- PostgreSQL database with Prisma
- Shared API contracts using Zod
- Frontend GitHub Actions CI checks

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | NestJS, Node.js, TypeScript |
| Database (planned) | PostgreSQL, Prisma |
| Shared Contracts (planned) | TypeScript, Zod |
| Calendar Integration (planned) | Google Calendar API, OAuth 2.0 |
| Package Management | pnpm Workspaces |
| Version Control | Git, GitHub |
| Code Quality | ESLint, Prettier |
| CI | GitHub Actions |

## Repository Structure

```text
PocketWatch/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/         # App Router pages and layouts
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── config/      # Frontend configuration
│   │   │   ├── constants/   # Frontend constants
│   │   │   ├── features/    # Feature-specific code
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Frontend utilities
│   │   │   ├── services/    # API communication
│   │   │   └── types/       # Frontend types
│   │   └── tests/
│   │
│   └── api/                 # NestJS backend
│       └── src/
│           ├── core/        # Shared backend infrastructure
│           ├── config/      # Backend configuration
│           ├── database/    # Database integration
│           ├── modules/     # Application features
│           ├── integrations/# External service integrations
│           ├── app.module.ts
│           └── main.ts
│
├── packages/
│   └── contracts/           # Planned shared API schemas and types
│
├── docs/                    # Project documentation
├── .github/
│   └── workflows/           # GitHub Actions CI
├── .nvmrc
├── .prettierrc.json
├── .prettierignore
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Getting Started

### Prerequisites

Install the following:

- Git
- Node.js 24
- pnpm 10.0.0

For Linux or WSL, we recommend managing Node.js through `nvm`.

### 1. Clone the Repository

```bash
git clone https://github.com/CSE115a-PocketWatch/PocketWatch.git
cd PocketWatch
```

### 2. Select the Node.js Version

```bash
nvm install
nvm use
```

The `.nvmrc` file specifies Node.js 24.

Enable Corepack if needed:

```bash
corepack enable
```

Verify the environment:

```bash
node --version
pnpm --version
```

### 3. Install Dependencies

From the repository root:

```bash
pnpm install
```

The monorepo uses pnpm workspaces to manage frontend, backend, and shared packages.

### 4. Start the Frontend

```bash
pnpm dev:web
```

Open:

http://localhost:3000

The frontend uses Next.js App Router.

Its main entry points are:

- `apps/web/src/app/layout.tsx` — Root application layout
- `apps/web/src/app/page.tsx` — Homepage
- `apps/web/src/app/global.css` — Global styles

### 5. Start the Backend

Open a second terminal in the repository root:

```bash
pnpm dev:api
```

The NestJS backend runs at:

http://localhost:3001

Both applications can run simultaneously in separate terminals.

## Development Commands

Run commands from the repository root unless otherwise specified.

| Command | Description |
| --- | --- |
| `pnpm dev:web` | Start the Next.js development server |
| `pnpm dev:api` | Start the NestJS development server |
| `pnpm build` | Build workspace packages with build scripts |
| `pnpm lint` | Run available workspace lint scripts |
| `pnpm typecheck` | Run available workspace TypeScript checks |
| `pnpm test` | Run available workspace test scripts |
| `pnpm format` | Format supported files with Prettier |
| `pnpm format:check` | Check formatting without modifying files |

### Frontend Validation

```bash
pnpm --filter @pocket-watch/web typecheck
pnpm --filter @pocket-watch/web lint
pnpm --filter @pocket-watch/web build
```

### Backend Validation

```bash
pnpm --filter @pocket-watch/api typecheck
pnpm --filter @pocket-watch/api build
```

### Formatting

Format the repository:

```bash
pnpm format
```

Check formatting:

```bash
pnpm format:check
```

Run formatting checks before opening a pull request.

## Development Guidelines

### Frontend

The frontend uses the Next.js App Router.

- Keep route definitions and layouts inside `src/app/`.
- Place reusable UI components inside `src/components/`.
- Organize feature-specific functionality inside `src/features/`.
- Keep API communication inside `src/services/`.
- Use `src/hooks/` for reusable React hooks.
- Use `src/constants/` for application constants.
- Avoid placing business logic directly inside page components when it can be separated into feature modules.

### Backend

The backend uses NestJS with a modular architecture.

- Keep application features inside `src/modules/`.
- Use `src/core/` for shared backend infrastructure.
- Keep environment configuration inside `src/config/`.
- Place database-related functionality inside `src/database/`.
- Keep third-party integrations inside `src/integrations/`.
- Use NestJS dependency injection for application services.
- Add tests for new business logic and API functionality.

### Shared Contracts

The planned `packages/contracts/` workspace will contain shared API request and response schemas.

Shared contracts should help the frontend and backend agree on data formats without duplicating type definitions.

## Git Workflow

PocketWatch follows a feature-branch and pull-request development workflow.

All changes to `main` should be submitted through pull requests rather than direct pushes.

The `main` branch is protected by GitHub branch protection rules, including a required backend CI status check.

### 1. Update Your Local Main Branch

Before starting new work, synchronize your local repository:

```bash
git switch main
git pull origin main
```

### 2. Create a Feature Branch

Create a new branch for your work:

```bash
git switch -c feat/feature-name
```

Use descriptive branch names following these conventions:

| Prefix | Purpose | Example |
| --- | --- | --- |
| `feat/` | New features | `feat/assignment-form` |
| `fix/` | Bug fixes | `fix/calendar-navigation` |
| `chore/` | Maintenance and configuration | `chore/update-eslint` |
| `docs/` | Documentation changes | `docs/update-readme` |
| `refactor/` | Code restructuring | `refactor/api-services` |
| `test/` | Tests and test improvements | `test/assignment-service` |

Do not implement new features directly on `main`.

### 3. Implement and Validate Changes

Before committing, run the relevant checks.

For frontend changes:

```bash
pnpm --filter @pocket-watch/web typecheck
pnpm --filter @pocket-watch/web lint
pnpm --filter @pocket-watch/web build
```

For backend changes:

```bash
pnpm --filter @pocket-watch/api typecheck
pnpm --filter @pocket-watch/api build
```

Check formatting:

```bash
pnpm format:check
```

Fix validation failures before requesting review.

### 4. Commit Your Changes

Stage the relevant files:

```bash
git add <files>
git status
```

Use descriptive commit messages.

Recommended format:

```text
<type>(<scope>): <description>
```

Examples:

```text
feat(web): add assignment creation form
feat(api): implement assignment endpoints
fix(web): correct calendar navigation
chore: update development dependencies
docs: update project setup instructions
```

Avoid committing generated build outputs, local environment files, or unrelated changes.

### 5. Push Your Feature Branch

Push your branch to GitHub:

```bash
git push -u origin feat/feature-name
```

Replace `feat/feature-name` with your actual branch name.

### 6. Open a Pull Request

1. Navigate to the PocketWatch GitHub repository.
2. Open the **Pull requests** tab.
3. Select **New pull request**.
4. Set the base branch to `main`.
5. Select your feature branch as the compare branch.
6. Add a descriptive title and summary.
7. Request a review from another engineer.
8. Wait for the required status checks and reviews before merging.

Pull requests should include:

- A summary of the changes
- Relevant implementation details
- Testing performed
- Screenshots for visible UI changes, when applicable
- Known limitations or follow-up work

Keep pull requests focused on a single feature, fix, or related set of changes whenever possible.

### 7. Pull Request Review and Merge Requirements

The `main` branch uses GitHub branch protection.

The following rules define the team's intended development workflow:

| Requirement | Policy |
| --- | --- |
| Pull requests | Required before merging into `main` |
| Code review | At least one approving review |
| Backend Checks | Required GitHub Actions status check |
| Frontend Checks | Planned as an additional required check |
| Review conversations | Resolve before merging |
| Up-to-date branches | Follow GitHub's configured requirement |
| Direct pushes to `main` | Avoid; enforce through branch protection |

Repository administrators must ensure the corresponding branch protection settings are enabled and saved in GitHub.

A pull request should not be merged until:

1. Required reviews have been completed.
2. All required CI checks have passed.
3. Review feedback has been addressed.
4. Required conversations have been resolved.
5. The branch satisfies any up-to-date requirements.

If a required check fails, fix the issue and push the correction to the same feature branch.

### 8. Update Your Branch When Necessary

If GitHub reports that your branch is behind `main`, update your local branch:

```bash
git fetch origin
git merge origin/main
```

Resolve any merge conflicts, run the relevant validation checks, and push the updated branch:

```bash
git push
```

### 9. Merge and Clean Up

Once the pull request satisfies the required checks and reviews, merge it using the repository's permitted merge method.

After merging:

```bash
git switch main
git pull origin main
```

Delete the completed local feature branch:

```bash
git branch -d feat/feature-name
```

Optionally delete the remote feature branch through GitHub.

## Continuous Integration

PocketWatch uses GitHub Actions to automatically validate code changes.

The CI workflow is located at:

```text
.github/workflows/ci.yml
```

### CI Triggers

The workflow is intended to run on:

- Pull requests targeting `main`
- Pushes to `main`

These checks help identify compilation errors and other problems before changes are merged.

### Required Status Checks

The `main` branch currently has the following required GitHub Actions check:

| Check | Purpose | Status |
| --- | --- | --- |
| Backend Checks | Validate the NestJS backend | Required |
| Frontend Checks | Validate the Next.js frontend | Planned |

Required status checks must pass before a pull request can be merged.

### Backend Checks

The `Backend Checks` job validates the NestJS backend.

Its validation includes:

- TypeScript type checking
- Backend compilation

Equivalent local commands:

```bash
pnpm --filter @pocket-watch/api typecheck
pnpm --filter @pocket-watch/api build
```

### Frontend Checks

Automated frontend validation is planned for GitHub Actions.

Until frontend CI is configured, frontend engineers must run the following commands locally before submitting a pull request:

```bash
pnpm --filter @pocket-watch/web typecheck
pnpm --filter @pocket-watch/web lint
pnpm --filter @pocket-watch/web build
```

Once the frontend workflow is implemented and verified, `Frontend Checks` should be added to the required status checks for `main`.

### Handling CI Failures

If a GitHub Actions check fails:

1. Open the pull request on GitHub.
2. Select the failed check.
3. Inspect the GitHub Actions logs.
4. Reproduce the failure locally.
5. Fix the underlying issue.
6. Commit and push the correction.
7. Wait for GitHub Actions to run again.

Do not merge pull requests with failing required checks.

### Branch Protection

Branch protection settings are managed in GitHub under:

**Settings → Branches → Branch protection rules**

The rule should target:

```text
main
```

Recommended protection settings:

- Require a pull request before merging.
- Require at least one approving review.
- Require status checks to pass before merging.
- Require `Backend Checks`.
- Require conversation resolution before merging.
- Require branches to be up to date before merging.
- Prevent bypassing branch protection rules where appropriate.

These settings help maintain code quality and prevent unreviewed changes from entering the main development branch.

### Continuous Deployment

Automated production deployment has not yet been configured.

GitHub Actions currently provides continuous integration rather than a complete CI/CD deployment pipeline.

Deployment configuration will be added once the application hosting strategy is finalized.

## Environment Variables

Environment variables will be introduced as authentication, database, and Google Calendar integrations are implemented.

Do not commit:

- `.env`
- `.env.local`
- API keys
- OAuth client secrets
- Database credentials
- Access tokens or refresh tokens

Document required variables in example environment files without including real secrets.

## Planned Application Workflow

1. A student creates an account and signs in.
2. The student adds assignments with deadlines and estimated completion times.
3. The student configures available study hours and session preferences.
4. PocketWatch generates a proposed study schedule.
5. The student reviews and adjusts the suggested sessions.
6. The student exports approved sessions to Google Calendar.

This workflow describes the intended MVP, not functionality that is currently implemented.

## Documentation

Additional technical documentation is maintained in the `docs/` directory.

Keep documentation updated when making significant changes to:

- Architecture
- Dependencies
- Development commands
- API contracts
- Environment configuration
- Deployment procedures
- Team development conventions
- Git workflow and branch protection rules

## Project Goals

PocketWatch aims to provide a simple, practical study-planning experience that helps students translate assignments and deadlines into manageable calendar sessions.

The initial MVP prioritizes core scheduling functionality, maintainable code, and a reliable development workflow over advanced features.

