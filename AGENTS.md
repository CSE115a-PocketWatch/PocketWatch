# AGENTS.md

Instructions for AI coding agents working in this repo. Humans: see README.md.

## Project

Pocket Watch: a web app that helps students schedule study sessions. Users add assignments
(deadline + estimated time), set availability and study limits, generate a draft study plan,
edit it, and export finalized sessions to Google Calendar.

Full design: `docs/design-doc.md`. Current sprint: `docs/sprints/`.

## Stack

- Monorepo: pnpm workspaces + Turborepo
- `apps/web`: Next.js (App Router), React, TypeScript, Tailwind
- `apps/api`: NestJS, TypeScript, REST
- `packages/contracts`: shared Zod schemas and TypeScript types
- Database: PostgreSQL via Prisma
- Integration: Google OAuth 2.0 + Google Calendar API v3 (`googleapis`)

## Commands

- Install: `pnpm install` (repo root)
- Run everything: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Run one app: `pnpm --filter web dev` / `pnpm --filter api dev`
- DB migration: `pnpm --filter api prisma migrate dev --name <change>`

Run lint and tests before calling a task done.

## Do not

- Commit secrets. Real values go in `.env` (gitignored); add new variable names to `.env.example`.
- Add dependencies without saying why in the PR description.
- Build anything listed as out of scope in the design doc.
- Edit files under `docs/` unless the task asks for it.

## Git

- Branch per task: `<initials>/<short-description>`, e.g. `ak/assignment-crud`.
- Small PRs tied to one user story task; reference the task in the PR title.
- Never push directly to `main`.

### Commit messages

Format: `<type>(<scope>): <summary>`

- **type**: `feat` (new feature), `fix` (bug fix), `test`, `docs`, `refactor`,
  `style` (formatting only), `chore` (config, dependencies, tooling)
- **scope**: `web`, `api`, `contracts`, `db`, `docs`, or `repo` for root config
- **summary**: imperative, lowercase, no period, under ~60 characters

Examples:
- `feat(api): add assignment create endpoint`
- `fix(web): prevent submitting assignment with past deadline`
- `test(api): cover scheduling with zero availability`
- `chore(repo): add turbo and pnpm workspace config`
- `docs: add sprint 1 plan`

One logical change per commit. Don't mix a feature and unrelated formatting in one commit.