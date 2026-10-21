
# PocketWatch

PocketWatch is a web application that helps students organize assignments and automatically schedule study sessions around their availability and existing calendar commitments.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** NestJS, Node.js, TypeScript
- **Database:** PostgreSQL (planned)
- **ORM:** Prisma (planned)
- **Calendar Integration:** Google Calendar API (planned)
- **Package Manager:** pnpm
- **Version Control:** Git and GitHub

## Prerequisites

Before running PocketWatch locally, install:

- Git
- Node.js 24
- pnpm 10
- nvm (recommended)

## General Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PocketWatch
```

Replace `<repository-url>` with the GitHub repository URL.

### 2. Configure Node.js

The project uses Node.js 24, specified in the root `.nvmrc` file.

If you have nvm installed:

```bash
nvm install
nvm use
```

Verify your Node.js version:

```bash
node --version
```

### 3. Install pnpm

If pnpm is not already installed:

```bash
npm install -g pnpm@10
```

Verify the installation:

```bash
pnpm --version
```

### 4. Install Dependencies

From the repository root:

```bash
pnpm install
```

This installs dependencies for all applications and shared packages in the monorepo.

## Running the Application

All commands below should be executed from the repository root.

### Backend (NestJS)

Start the backend development server:

```bash
pnpm dev:api
```

The backend runs at:

http://localhost:3001

The backend uses watch mode, automatically restarting when source files change.

**Note:** The backend currently has no registered HTTP routes. A `404 Not Found` response at the root URL is expected until endpoints are implemented.

To check TypeScript compilation:

```bash
pnpm --filter @pocket-watch/api exec tsc --noEmit
```

### Frontend (Next.js)

Start the frontend development server:

```bash
pnpm dev:web
```

Once the frontend application scaffold is configured, the frontend will be available at:

http://localhost:3000

**Current status:** Frontend dependencies are installed, but the Next.js application scaffold must be completed before the frontend can run successfully.

### Running Both Servers

Open two separate terminals at the repository root.

**Terminal 1 — Backend**

```bash
pnpm dev:api
```

**Terminal 2 — Frontend**

```bash
pnpm dev:web
```

Both services run independently.

| Service | URL | Port |
|---|---|---|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:3001 | 3001 |

To stop either development server, press `Ctrl + C` in its terminal.

## Project Structure

```text
PocketWatch/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── features/
│   │       ├── services/
│   │       ├── hooks/
│   │       ├── constants/
│   │       ├── lib/
│   │       ├── types/
│   │       └── config/
│   │
│   └── api/                  # NestJS backend
│       └── src/
│           ├── core/
│           ├── config/
│           ├── database/
│           ├── modules/
│           ├── integrations/
│           ├── main.ts
│           └── app.module.ts
│
├── packages/
│   └── contracts/            # Shared schemas and TypeScript types
├── docs/                     # Project documentation
├── .nvmrc                    # Node.js version
├── package.json              # Root workspace scripts
├── pnpm-workspace.yaml       # Workspace configuration
└── pnpm-lock.yaml            # Dependency lockfile
```

## Development Workflow

All development should occur on feature branches rather than directly on `main`.

### 1. Update Your Local Main Branch

```bash
git switch main
git pull origin main
```

### 2. Create a Feature Branch

```bash
git switch -c feat/feature-name
```

Recommended branch prefixes:

- `feat/` — New features
- `fix/` — Bug fixes
- `chore/` — Configuration, tooling, or maintenance
- `docs/` — Documentation changes
- `refactor/` — Code restructuring without behavior changes

### 3. Commit Changes

Stage your changes:

```bash
git add .
```

Review staged files:

```bash
git diff --cached --stat
```

Commit:

```bash
git commit -m "feat: describe your changes"
```

### 4. Push and Open a Pull Request

```bash
git push -u origin feat/feature-name
```

Open a pull request on GitHub targeting `main`.

All changes should be reviewed before merging.

## Useful Commands

| Command | Description |
|---|---|
| `pnpm install` | Install workspace dependencies |
| `pnpm dev:web` | Start the frontend development server |
| `pnpm dev:api` | Start the backend development server |
| `pnpm build` | Build workspace packages with build scripts |
| `pnpm lint` | Run configured workspace lint scripts |
| `pnpm test` | Run configured workspace tests |
| `pnpm typecheck` | Run configured TypeScript checks |

**Note:** Some workspace commands may not be fully functional until the remaining application and package configurations are completed.

## Environment Variables

Environment variables should be stored in local `.env` files and must not be committed to Git.

As database and Google Calendar integrations are implemented, required environment variables should be documented in `.env.example` files.

Never commit API keys, OAuth client secrets, database passwords, or other credentials.

## Continuous Integration (CI)

PocketWatch uses GitHub Actions to automatically validate code changes.

The CI workflow is defined in:

`.github/workflows/ci.yml`

### Pipeline Triggers

The pipeline runs automatically when:

- A pull request targets the `main` branch.
- Changes are pushed to the `main` branch.

### Current CI Checks

The pipeline currently performs the following backend checks:

1. **Dependency Installation:** Installs workspace dependencies using pnpm.
2. **TypeScript Validation:** Checks the backend for TypeScript errors.
3. **Build:** Compiles the NestJS backend.

Frontend validation and automated tests will be added as development progresses.

### Running CI Checks Locally

Before opening a pull request, run:

```bash
pnpm --filter @pocket-watch/api typecheck
pnpm --filter @pocket-watch/api build
```

Both commands should complete successfully.

### Viewing Pipeline Results

1. Navigate to the repository on GitHub.
2. Select the **Actions** tab.
3. Open the relevant workflow run.
4. Inspect the individual jobs and their logs.

A failed CI check should be investigated and resolved before merging changes.

## Pull Request Workflow

All engineers should use feature branches and pull requests when contributing to PocketWatch.

### 1. Update Your Local Repository

```bash
git switch main
git pull origin main
```

### 2. Create a Feature Branch

```bash
git switch -c feat/feature-name
```

Use the following branch naming conventions:

| Prefix | Purpose |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Maintenance and configuration |
| `docs/` | Documentation changes |
| `refactor/` | Code restructuring |
| `test/` | Adding or updating tests |
| `ci/` | CI/CD pipeline changes |

### 3. Implement and Validate Changes

Make changes within the relevant application or package.

Before committing:

```bash
pnpm --filter @pocket-watch/api typecheck
pnpm --filter @pocket-watch/api build
```

Run any additional tests relevant to your changes.

### 4. Commit Changes

Stage and inspect your changes:

```bash
git add .
git diff --cached --stat
```

Commit with a descriptive message:

```bash
git commit -m "feat: implement assignment creation endpoint"
```

### 5. Push Your Branch

```bash
git push -u origin feat/feature-name
```

Replace `feat/feature-name` with your actual branch name.

### 6. Open a Pull Request

On GitHub:

1. Navigate to the **Pull Requests** tab.
2. Select **New pull request**.
3. Set the base branch to `main`.
4. Select your feature branch as the compare branch.
5. Describe the changes, motivation, and testing performed.
6. Request a review from another engineer.

### 7. Code Review and Merge

Before merging a pull request:

- Ensure the CI pipeline passes.
- Obtain at least one approving review from another engineer.
- Resolve outstanding review comments.
- Verify that changes follow the project's architecture.
- Ensure relevant documentation and tests are updated.

Use **Squash and merge** when available to keep the main branch history clean.

Delete the feature branch after merging.

## Engineering Standards

### Code Organization

- Keep frontend code in `apps/web/`.
- Keep backend code in `apps/api/`.
- Place shared API contracts and types in `packages/contracts/`.
- Follow the existing modular architecture.
- Avoid introducing unnecessary dependencies.
- Keep changes focused and independently reviewable.

### Testing

- Run relevant TypeScript checks before opening a PR.
- Add unit tests for new business logic when the test framework is available.
- Do not merge known failing changes.
- Include regression tests when fixing bugs, where practical.

### Architecture Changes

Changes involving the following should receive principal engineer review:

- Database schemas and migrations
- Authentication and authorization
- Shared API contracts
- Application architecture
- External integrations
- CI/CD configuration

### Security

- Never commit secrets, API keys, or credentials.
- Store local configuration in ignored `.env` files.
- Document required environment variables using `.env.example`.
- Avoid logging sensitive user information.

## Repository Governance

The team follows a pull-request-based development workflow.

The following requirements are currently **team conventions**, not automatically enforced GitHub restrictions:

- Feature branches for development
- At least one approving review
- Passing CI checks before merging
- Resolved review comments
- Principal engineer review for architectural changes

Mandatory branch protection and required status checks will be configured when repository administrator access is available.

Until then, contributors are expected to follow these requirements manually.

