# Cinder

Jira-inspired full-stack agile project management app: projects, issues, sprints, Kanban, RBAC, notifications, attachments, bilingual UI (EN/VI), and **AI-powered sprint retrospectives**.

Personal project for internship applications — focused on real collaboration workflows, not just CRUD.

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
| **AI / Storage / Email** | Google Gemini, Cloudinary, Resend |
| **Deploy** | Vercel (frontend) + hosted API / PostgreSQL |

## Key Features

- **Authentication** — Email/password + Google Sign-In; JWT access token and httpOnly refresh cookie
- **i18n** — EN/VI toggle (Zustand + `localStorage`); UI chrome only (user content is not translated)
- **RBAC** — Project-scoped Admin / Member roles for invites, settings, and privileged actions
- **Projects & invites** — Unique project keys; token-based invitations; in-app + email (Resend)
- **Issues** — Jira-like keys (`PROJ-1`), types (task / bug / subtask), status, priority, assignee, epic, due date
- **Kanban board** — Drag-and-drop status with optimistic UI; sprint scope dropdown (all issues or a chosen sprint)
- **Backlog & sprints** — Paginated backlog; sprint-scoped issue lists; drag issues between backlog and sprints
- **Complete sprint** — Done issues stay on the completed sprint; all incomplete issues move to **one** destination (backlog or a planned sprint); snapshot `sprint_close_issue_ids` for AI
- **Epics** — Group related issues under larger initiatives
- **Search & filters** — Search by key/title; filter by status, priority, type, assignee, epic (Board & Backlog)
- **Comments & attachments** — Discuss on issues; Cloudinary files/images or external links; profile avatars
- **Notifications** — In-app inbox for assign, comment, sprint, invite, and stale-issue events
- **Activity log** — Paginated audit trail of project actions
- **AI sprint summary** — On complete, Gemini writes a retrospective from snapshot + stats; cached in PostgreSQL
- **Stale-issue warnings** — Daily cron flags inactive assigned issues

## Screenshots

Add images under `docs/` and uncomment:

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
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── i18n/             # en.ts / vi.ts / useT()
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/            # auth + locale
│   │   └── types/
│   └── .env.example
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── cronjobs/
│   │   └── helper/
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL (local or Neon)
- Optional: Gemini API key, Firebase project, Cloudinary unsigned upload preset, Resend API key

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
| `VITE_API_BASE_URL` | API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_FIREBASE_*` | Firebase web config (Google Sign-In) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |

Never commit `.env` files.

## API Overview

Base path: `/api`

| Module | Prefix | Capabilities |
|--------|--------|----------------|
| Auth | `/auth` | Register, login, Google, me, profile, refresh, logout |
| Projects | `/projects` | CRUD, invite, accept/decline, members, leave |
| Issues | `/issues` | CRUD, status, assign, priority, sprint, epic, paginated list (`page` / `limit` / `sprint_id`) |
| Sprints | `/sprints` | CRUD-ish, status transitions (`move_incomplete_to` on complete) |
| Epics | `/epics` | CRUD |
| Comments | `/comments` | CRUD on issues |
| Attachments | `/attachments` | List / create / delete |
| Notifications | `/notifications` | List, mark read, mark all read |
| Activities | `/activities` | Paginated project activity |
| AI | `/ai` | `POST /sprints/:id/summarize` |

## Highlights for Reviewers

| Topic | Where to look |
|-------|----------------|
| Layered API | `backend/src/routes` → `controllers` → `services` → `repositories` |
| RBAC | `backend/src/middlewares/project-role.middleware.ts` |
| Complete sprint (one destination) | `backend/src/services/sprint.service.ts` |
| AI summary from snapshot | `backend/src/services/ai.service.ts` |
| Stale warnings | `backend/src/cronjobs/staleIssue.job.ts` |
| Kanban optimistic DnD | `frontend/src/components/board/KanbanBoard.tsx` |
| Sprint-scoped pagination | `frontend/src/api/issue.api.ts` + issue repository `skip`/`take` |
| i18n | `frontend/src/i18n/` + `frontend/src/store/locale.store.ts` |

## Future Improvements

- [ ] Short demo video (login → board → complete sprint → AI summary)
- [ ] Automated tests (API + critical UI flows)
- [ ] Real-time notifications (SSE / WebSocket)
- [ ] Translate persisted notification / activity payloads (currently stored in one language)

## Author

Personal full-stack project for internship applications.

If you have feedback or questions, feel free to open an issue.
