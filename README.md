# Project Management System

Jira-inspired full-stack agile project management app for teams: projects, issues, sprints, Kanban, RBAC, notifications, attachments, and **AI-powered sprint retrospectives**.

Built as a personal project for internship applications — focused on real collaboration workflows, not just CRUD.

## Live Demo

- **Website:** [https://project-management-system-theta-taupe.vercel.app/](https://project-management-system-theta-taupe.vercel.app/)
- **Demo video:** Coming soon

> First load may take a few seconds if the backend is waking up from sleep.

Register a new account (email/password or Google) to explore the app.

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, @dnd-kit, Firebase Auth |
| **Backend** | Node.js, Express 5, TypeScript, Prisma, PostgreSQL, JWT, Firebase Admin, Zod, node-cron |
| **AI / Storage** | Google Gemini 2.5 Flash, Cloudinary |
| **Deploy** | Vercel (frontend) + hosted API / PostgreSQL |

## Key Features

- **Authentication** — Email/password + Google Sign-In; JWT access token (15m) and refresh token (7d)
- **RBAC** — Project-scoped Admin / Member roles for invites, settings, and privileged actions
- **Projects & invites** — Create workspaces with unique project keys; token-based invitations (7-day expiry)
- **Issues** — Jira-like keys (`PROJ-1`), types (task/bug/story/subtask), status, priority, assignee, epic, sprint
- **Kanban board** — Drag-and-drop status updates with optimistic UI (`@dnd-kit`)
- **Backlog & sprints** — Plan work; drag issues between backlog and sprints; sprint lifecycle (planned → active → completed)
- **Epics** — Group related issues under larger initiatives
- **Search & filters** — Client-side search by key/title; filter by status, priority, type, assignee, epic (Board & Backlog)
- **Comments** — Discuss work on issues; notify assignees
- **Attachments** — Upload files/images via Cloudinary (≤10MB) or attach external links; profile avatars (≤2MB)
- **Notifications** — In-app inbox for assign, comment, sprint, invite, and stale-issue events
- **Activity log** — Paginated audit trail of project actions (default 20 / max 100 per page)
- **AI sprint summary** — On sprint complete, Gemini generates a Vietnamese retrospective from precomputed completion stats; summary cached in PostgreSQL
- **Stale-issue warnings** — Daily cron flags inactive assigned issues (default 7 days, max 5 warnings)
- **50+ REST API endpoints** across auth, projects, issues, sprints, epics, comments, attachments, notifications, activity, and AI

## Screenshots

Add images under `docs/` and uncomment below:

<!--
| Board | Backlog | AI Sprint Summary |
|-------|---------|-------------------|
| ![Board](docs/board.png) | ![Backlog](docs/backlog.png) | ![AI Summary](docs/ai-summary.png) |
-->

## Architecture

```
┌─────────────────┐     REST /api      ┌──────────────────────────────────────┐
│  React (Vite)   │ ─────────────────► │  Express                             │
│  React Query    │                    │  routes → controllers → services     │
│  Zustand        │                    │              ↓                       │
└─────────────────┘                    │         repositories                 │
                                       │              ↓                       │
                                       │         Prisma / PostgreSQL          │
                                       │                                      │
                                       │  + Gemini AI  + node-cron            │
                                       │  + Firebase   + Cloudinary (client)  │
                                       └──────────────────────────────────────┘
```

## Project Structure

```
project-management-system/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios API clients
│   │   ├── components/       # Board, backlog, issue, sprint, UI, ...
│   │   ├── pages/            # Login, projects, board, backlog, settings, ...
│   │   ├── hooks/
│   │   ├── store/            # Auth (Zustand)
│   │   └── types/
│   └── .env.example
├── backend/                  # Express API
│   ├── prisma/               # Schema + migrations
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── cronjobs/         # Stale-issue job
│   │   └── helper/           # Notifications, sprint-summary stats
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL database (local or Neon)
- (Optional) Gemini API key, Firebase project, Cloudinary unsigned upload preset

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Server defaults to `http://localhost:5000`.

**Important env vars** (`backend/.env`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `GEMINI_API_KEY` | Google AI Studio key (sprint summary) |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (Google login on server) |
| `STALE_DAYS` | Inactivity threshold (default `7`) |
| `STALE_CRON_SCHEDULE` | Cron expression (default `0 9 * * *`) |
| `FRONTEND_URL` | CORS origin in production |

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App defaults to `http://localhost:5173`.

**Important env vars** (`frontend/.env`):

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base URL (e.g. `http://localhost:5000/api` or production `/api`) |
| `VITE_FIREBASE_*` | Firebase web config (Google Sign-In) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |

## API Overview

Base path: `/api`

| Module | Prefix | Capabilities |
|--------|--------|----------------|
| Auth | `/auth` | Register, login, Google, me, profile, refresh, logout |
| Projects | `/projects` | CRUD, invite, accept/decline, members, leave |
| Issues | `/issues` | CRUD, status, assign, priority, sprint, epic |
| Sprints | `/sprints` | CRUD-ish, status transitions, sprint issues |
| Epics | `/epics` | CRUD |
| Comments | `/comments` | CRUD on issues |
| Attachments | `/attachments` | List / create / delete |
| Notifications | `/notifications` | List, mark read, mark all read |
| Activities | `/activities` | Paginated project activity |
| AI | `/ai` | `POST /sprints/:id/summarize` |

## Highlights for Reviewers

| Topic | What to look at |
|-------|-----------------|
| Layered API | `backend/src/routes` → `controllers` → `services` → `repositories` |
| RBAC | `middlewares/project-role.middleware.ts` |
| AI summary | `services/ai.service.ts` + `helper/sprint-summary.helper.ts` |
| Stale warnings | `cronjobs/staleIssue.job.ts` |
| Kanban DnD | `frontend/src/components/board/KanbanBoard.tsx` |

## Future Improvements

- [ ] Short demo video (login → board → complete sprint → AI summary)
- [ ] Server-side search and issue list pagination
- [ ] Automated tests (API + critical UI flows)
- [ ] Real-time notifications (SSE / WebSocket)
- [ ] Rate limiting for AI endpoints

## Author

Personal full-stack project for internship applications.

If you have feedback or questions, feel free to open an issue.
