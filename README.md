# KinderGuide Montessori ERP/LMS

KinderGuide is a role-based Montessori school platform with dashboards for admins, teachers, parents, and students. It includes admissions/users, attendance, leave workflows, lessons, assessments, progress reports, assignments, parent messaging, finance, inventory, HR/payroll planning, curriculum tracking, gamified learning, AI insights, and offline sync support.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide icons
- Backend: Node.js, Express, Prisma, PostgreSQL
- Security: JWT auth, role guards, tenant scoping, Helmet, auth rate limiting, server-side HTML sanitization
- Offline: localStorage snapshots plus queued write replay when connectivity returns

## Setup

```bash
npm install
cd server
npm install
copy .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

In a second terminal:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost:4000/api`

## Environment

Root `.env` is optional for the Vite app. Backend settings live in `server/.env`.

Required backend variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
JWT_SECRET="replace-with-at-least-32-characters"
JWT_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="http://localhost:5173"
RESEND_API_KEY=""
EMAIL_FROM="KinderGuide <onboarding@resend.dev>"
AI_API_KEY=""
AI_API_BASE="https://api.openai.com/v1"
AI_MODEL="gpt-4o-mini"
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@kinderguide.com` | `admin123` |
| Teacher | `amina.khan@faculty.kinderguide.com` | `teacher123` |
| Parent | `bilal.ahmed@parent.kinderguide.com` | `parent123` |
| Student | `bilal.ahmed@kinderguide.com` | `student123` |

## Commands

```bash
npm run lint
npm run build
cd server
npm run typecheck
npm run db:migrate
npm run db:seed
```

## Architecture

- `src/`: React app, role routes, dashboards, shared UI, offline cache/queue, AI panel.
- `server/src/routes/`: Express API modules for auth, admin, teacher, family, academics, finance, inventory, assignments, messages, AI, and uploads.
- `server/prisma/schema.prisma`: PostgreSQL schema with school tenants, users, credentials, attendance, payments, inventory, learning, and communications.
- `server/prisma/migrations/`: database migration history.

## Key Modules

- Admin: user management, classes, finance, inventory, HR/payroll, curriculum, reports.
- Teacher: live class, schedule, lessons, attendance, students, streaks, tests, assignments, remarks, messages.
- Parent: child dashboard, attendance/leaves, remarks, daily work, teachers, messages.
- Student: learning game, live class, lectures, tests, reports, assignments, feedback.
- AI: role-scoped insights, charts, assistant Q&A, optional OpenAI-compatible classifier.
- Offline: cached bootstrap/AI/finance/inventory data and queued mutation replay.
