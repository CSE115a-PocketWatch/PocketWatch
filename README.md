
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
git clone https://github.com/arshyg/PocketWatch.git
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

Development should happen through feature branches and pull requests.

### 1. Create a Branch

Update your local main branch:

```bash
git checkout main
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feat/feature-name
```

Example branch names:

- `feat/assignment-form`
- `feat/calendar-connection`
- `fix/frontend-navigation`
- `chore/update-eslint`
- `docs/update-setup`

### 2. Make Changes and Validate

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

### 3. Commit Changes

Use descriptive commit messages.

Examples:

```text
feat(web): add assignment creation form
feat(api): add assignment endpoints
fix(web): correct calendar navigation
chore: update development dependencies
docs: update project setup instructions
```

### 4. Push and Open a Pull Request

```bash
git push -u origin feat/feature-name
```

Open a pull request targeting `main`.

Pull requests should include:

- A summary of the changes
- Relevant testing performed
- Screenshots for visible UI changes, when applicable
- Any known limitations or follow-up work

Request review before merging.

## Continuous Integration

GitHub Actions is used for automated validation.

The initial CI workflow is located at:

```text
.github/workflows/ci.yml
```

CI is intended to run on pull requests targeting `main` and pushes to `main`.

The backend validation workflow has been configured. Frontend validation should be added to CI as the frontend setup is finalized.

The project does not currently have an automated production deployment pipeline.

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

## Project Goals

PocketWatch aims to provide a simple, practical study-planning experience that helps students translate assignments and deadlines into manageable calendar sessions.

The initial MVP prioritizes core scheduling functionality, maintainable code, and a reliable development workflow over advanced features.

