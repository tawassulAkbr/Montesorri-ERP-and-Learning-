# KinderGuide Server

Node.js + Express + Prisma + PostgreSQL backend for the KinderGuide Montessori ERP.
This folder is fully self-contained; the React frontend in `../src` is separate.

## Requirements

- Node.js 20+
- A PostgreSQL database (Neon free tier recommended); connection string goes in `.env`
- Optional: a Resend API key (free tier) for sending credential & password-reset emails.
  Without it, emails are logged to the console instead of sent.

## Setup

```bash
npm install
cp .env.example .env     # then fill in DATABASE_URL, JWT_SECRET, RESEND_API_KEY
npm run db:migrate       # create tables (or: npm run db:push)
npm run db:seed          # creates the single admin account
npm run dev              # starts on http://localhost:4000
```

Seeded demo logins: `admin@kinderguide.com` / `admin123`, `amina.khan@faculty.kinderguide.com` / `teacher123`, `bilal.ahmed@kinderguide.com` / `student123`, `bilal.ahmed@parent.kinderguide.com` / `parent123`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start API with hot reload (tsx watch) |
| `npm run typecheck` | TypeScript check |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:push` | Push schema without migration files |
| `npm run db:studio` | Browse data in Prisma Studio |
| `npm run db:seed` | Seed the admin account + live-class singleton |

## API overview

All endpoints are prefixed with `/api` and return JSON. Protected routes need
`Authorization: Bearer <token>` (token comes from `POST /api/auth/login`).

- **Auth**: `POST /auth/login`, `GET /auth/me`, `PUT /auth/change-password`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- **Admin** (superuser): `GET /admin/dashboard`, `POST /admin/teachers`, `POST /admin/students` (auto-creates the parent account; credentials emailed to both), `GET /admin/teachers|students|parents` (teacher list includes today's derived status), `PATCH /admin/students/:id/fee-due`, `POST /admin/users/:id/reset-password` (new password emailed), `GET /admin/leaves`, `PATCH /admin/leaves/:id`
- **Teacher**: `GET /teachers/today-status`, `POST /teachers/mark-present`, `POST /teachers/apply-leave`, `GET /teachers/my-leaves`, `GET /teachers/students` (roster: guardian names + fee-due flag, never fee amounts), `POST /teachers/attendance` (batch roll call), `GET /teachers/attendance`, `GET|PATCH /teachers/student-leaves(/:id)`
- **Student**: `GET /students/me`, `GET /students/my-attendance`, `GET /students/my-results`, `GET /students/my-leaves`
- **Parent**: `GET /parents/me`, `GET /parents/children`, `POST /parents/apply-leave`, `GET /parents/children/:id/attendance|results|leaves`
- **Content**: `/lessons`, `/tests` (+`/:id/results`), `/remarks`, `/daily-work` (+`/:id/complete`), `/schedule`, `/live-class` (singleton: `/start`, `/end`)
- **Notifications**: `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

## Business rules

- Only the admin creates accounts. New credentials are emailed to the user and also returned to the admin in the response.
- Teacher status for today is **derived**: present mark → `present`; approved leave covering today → `leave`; weekday otherwise → `absent`; weekend → `null`. No cron jobs.
- Accepting a leave backfills `leave` attendance records for every weekday in the requested range (transactional).
- Fee toggles create paired notifications for the student and their parent. Fee amounts are only returned to the admin.
- Remark/daily-work HTML is sanitized server-side before storage.

## Environment variables

See `.env.example`. Never commit `.env`.
