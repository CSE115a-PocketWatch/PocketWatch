# Pocket Watch — Software Design Document

**Version:** 1.0
**Project Duration:** 8 Weeks
**Status:** Initial Design

## Project Overview

Study Planner is a web application that helps students organize assignments and automatically schedule study sessions around their availability and existing calendar commitments.

Users can create assignments, specify estimated completion times and deadlines, define when they are available to study, and generate a proposed study schedule. Users can review and edit the schedule before adding finalized sessions to Google Calendar.

## Goals and Scope

### Core Features (MVP)

- User registration and authentication.
- Create, edit, and delete assignments.
- Set assignment deadlines, priorities, and estimated completion times.
- Configure weekly availability and daily study limits.
- Generate preliminary study plans that divide assignments into study sessions.
- Preview and manually edit proposed sessions.
- Identify scheduling conflicts and warn users when available time is insufficient.
- Connect to Google Calendar and add finalized study sessions.

### Out of Scope

- AI-powered task planning or autonomous agents within the product.
- Advanced schedule optimization.
- Collaboration between multiple users.
- Mobile applications.
- Support for calendar providers other than Google Calendar.

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- NestJS
- Node.js
- TypeScript
- REST API

### Database
- PostgreSQL
- Prisma ORM

### Shared Contracts
- Zod for runtime validation and TypeScript type inference.
- A shared package for frontend/backend request and response schemas.

### External Integration
- Google Calendar API v3
- Google OAuth 2.0
- Google APIs Node.js client library (googleapis)

### Development Tools
- Git and GitHub
- pnpm workspaces for monorepo management
- Turborepo for task orchestration, if needed

## System Architecture

The application will use a frontend/backend architecture organized within a single monorepo.

### Frontend

The Next.js application will provide the user interface for managing assignments, configuring availability, reviewing generated schedules, and connecting Google Calendar.

The frontend will communicate with the backend through REST endpoints and use shared schemas to validate request and response data.

### Backend

The NestJS application will handle authentication, assignment management, availability settings, schedule generation, feasibility checks, and Google Calendar integration.

The backend will enforce user authorization and validate incoming requests before processing them.

### Database

PostgreSQL will persist user accounts, assignments, availability rules, study plans, study sessions, and Google Calendar synchronization information.

Prisma will provide database access and schema migrations.

### Shared Contracts

A shared package will define reusable TypeScript types and Zod schemas for API requests, responses, and relevant domain objects.

This package will reduce duplicated definitions and help keep the frontend and backend consistent as the application evolves.

### Google Calendar Integration

The backend will use Google OAuth 2.0 to obtain the user's authorization and the Google Calendar API to retrieve existing events and create finalized study sessions.

Google Calendar event IDs will be stored in the database to support subsequent updates and prevent duplicate event creation.

## Proposed Repository Structure

```
pocket-watcher/
  apps/
    web/          — Next.js frontend
    api/          — NestJS backend
  packages/
    contracts/    — Shared schemas and TypeScript types
  prisma/
    schema.prisma
  package.json
  pnpm-workspace.yaml
  turbo.json
```

The scheduling algorithm will initially live in a scheduling module within the backend. It can be extracted into a separate package if the project grows.

## Data Model

The initial database will include the following entities.

### User
- id
- email
- authentication reference or password hash
- timezone
- createdAt

### Assignment
- id
- userId
- title
- description
- deadline
- estimatedMinutes
- priority
- status

### AvailabilityRule
- id
- userId
- dayOfWeek
- startTime
- endTime

### StudyPlan
- id
- userId
- status (draft or finalized)
- createdAt

### StudySession
- id
- studyPlanId
- assignmentId
- startAt
- endAt
- status
- googleCalendarEventId

### CalendarConnection
- id
- userId
- Google account identifier
- encrypted refresh token
- synchronization metadata

Relationships and fields may be adjusted during implementation. All user-owned records must be protected by server-side authorization checks.

## Scheduling Logic

The scheduling engine will generate preliminary study sessions using assignment requirements, availability rules, daily study limits, and existing calendar events.

The initial algorithm will:

1. Retrieve incomplete assignments and their remaining estimated work.
2. Retrieve availability rules and existing calendar busy intervals.
3. Calculate usable time slots before each assignment deadline.
4. Prioritize assignments by deadline and priority.
5. Divide work into sessions that respect configured session lengths and daily limits.
6. Validate the resulting schedule for overlaps and deadline violations.
7. Return a proposed schedule and a feasibility report.

If the required work exceeds available capacity, the application will warn the user and report the estimated shortfall.

Generated schedules will remain drafts until the user reviews and finalizes them.

## API Design

The backend will expose REST endpoints, including:

- `POST /assignments` — Create an assignment.
- `GET /assignments` — Retrieve assignments.
- `PATCH /assignments/` — Update an assignment.
- `DELETE /assignments/` — Delete an assignment.
- `PUT /availability` — Update availability preferences.
- `POST /plans/generate` — Generate a preliminary study plan.
- `GET /plans/` — Retrieve a study plan.
- `PATCH /plans//sessions/` — Edit a proposed session.
- `POST /plans//validate` — Validate a proposed schedule.
- `POST /plans//finalize` — Finalize a plan and publish its sessions.
- `POST /integrations/google/connect` — Initiate Google authorization.
- `GET /integrations/google/callback` — Handle the OAuth callback.

Endpoint details and response schemas will be defined in the shared contracts package and documented using OpenAPI.

## Google Calendar Integration

The integration will support the following workflow:

1. The user authorizes Google Calendar access.
2. The backend retrieves relevant calendar events to identify busy periods.
3. The scheduling engine generates a draft schedule.
4. The user reviews and edits the proposed sessions.
5. The backend creates corresponding Google Calendar events after approval.

Event

## Design Considerations

Mobile vs website

## Sprint breakdown

Note: Sprint plans for this project are 7 days. This is to maximize efficiency