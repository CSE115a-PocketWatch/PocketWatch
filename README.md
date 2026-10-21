
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

