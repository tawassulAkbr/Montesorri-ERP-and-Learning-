# KinderGuide API

REST API for the KinderGuide Montessori ERP. The Express server lives in `server/` and is mounted under `/api`. JSON is used for all request and response bodies except file upload.

- **Base URL (local):** `http://localhost:4000`
- **Prefix:** `/api`
- **Frontend (Vite proxy):** requests from the app go to `/api/...` on `http://localhost:5173`

Auth column: `public` (no token), `any` (any logged-in role), or a specific role.

---

## Endpoint index

### Health and session

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/health` | public |
| `POST` | `/api/auth/login` | public |
| `GET` | `/api/auth/me` | any |
| `PUT` | `/api/auth/profile` | any |
| `PUT` | `/api/auth/change-password` | any |
| `POST` | `/api/auth/forgot-password` | public |
| `POST` | `/api/auth/reset-password` | public |
| `GET` | `/api/bootstrap` | any |

### Admin

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/admin/dashboard` | admin |
| `POST` | `/api/admin/teachers` | admin |
| `GET` | `/api/admin/teachers` | admin |
| `PATCH` | `/api/admin/teachers/:id` | admin |
| `POST` | `/api/admin/students` | admin |
| `GET` | `/api/admin/students` | admin |
| `GET` | `/api/admin/parents` | admin |
| `PATCH` | `/api/admin/students/:id/fee-due` | admin |
| `POST` | `/api/admin/students/:id/fee-reminder` | admin |
| `POST` | `/api/admin/users/:id/reset-password` | admin |
| `GET` | `/api/admin/leaves` | admin |
| `PATCH` | `/api/admin/leaves/:id` | admin |
| `GET` | `/api/admin/feedback` | admin |
| `GET` | `/api/admin/assignments` | admin |
| `GET` | `/api/admin/teacher-reports` | admin |
| `GET` | `/api/admin/finance/payments` | admin |
| `POST` | `/api/admin/finance/payments` | admin |
| `GET` | `/api/admin/finance/summary` | admin |
| `GET` | `/api/admin/inventory/items` | admin |
| `GET` | `/api/admin/inventory/low-stock` | admin |
| `POST` | `/api/admin/inventory/items` | admin |
| `PATCH` | `/api/admin/inventory/items/:id` | admin |
| `POST` | `/api/admin/inventory/items/:id/move` | admin |
| `GET` | `/api/admin/inventory/movements` | admin |

### Teacher

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/teachers/today-status` | teacher |
| `POST` | `/api/teachers/mark-present` | teacher |
| `POST` | `/api/teachers/apply-leave` | teacher |
| `GET` | `/api/teachers/my-leaves` | teacher |
| `GET` | `/api/teachers/students` | teacher |
| `POST` | `/api/teachers/attendance` | teacher |
| `GET` | `/api/teachers/attendance` | teacher |
| `GET` | `/api/teachers/student-leaves` | teacher |
| `PATCH` | `/api/teachers/student-leaves/:id` | teacher |
| `GET` | `/api/teachers/messages/threads` | teacher |
| `GET` | `/api/teachers/messages/contacts` | teacher |
| `GET` | `/api/teachers/messages/:parentId` | teacher |
| `POST` | `/api/teachers/messages/:parentId` | teacher |
| `GET` | `/api/teachers/feedback` | teacher |
| `PATCH` | `/api/teachers/feedback/:id/read` | teacher |
| `POST` | `/api/teachers/assignments` | teacher |
| `GET` | `/api/teachers/assignments` | teacher |
| `DELETE` | `/api/teachers/assignments/:id` | teacher |
| `GET` | `/api/teachers/assignments/:id/submissions` | teacher |
| `PATCH` | `/api/teachers/assignments/submissions/:id/grade` | teacher |
| `GET` | `/api/teachers/streaks` | teacher |

### Student

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/students/me` | student |
| `GET` | `/api/students/my-attendance` | student |
| `GET` | `/api/students/my-results` | student |
| `GET` | `/api/students/my-leaves` | student |
| `POST` | `/api/students/feedback` | student |
| `GET` | `/api/students/feedback/mine` | student |
| `GET` | `/api/students/assignments` | student |
| `POST` | `/api/students/assignments/:id/submit` | student |
| `GET` | `/api/students/learning/daily` | student |
| `POST` | `/api/students/learning/submit` | student |
| `GET` | `/api/students/learning/progress` | student |

### Parent

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/parents/me` | parent |
| `GET` | `/api/parents/children` | parent |
| `POST` | `/api/parents/apply-leave` | parent |
| `GET` | `/api/parents/children/:id/attendance` | parent |
| `GET` | `/api/parents/children/:id/results` | parent |
| `GET` | `/api/parents/children/:id/leaves` | parent |
| `GET` | `/api/parents/finance` | parent |
| `GET` | `/api/parents/messages/threads` | parent |
| `GET` | `/api/parents/messages/:teacherId` | parent |
| `POST` | `/api/parents/messages/:teacherId` | parent |

### Shared academics, files, notifications, AI

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/upload` | any |
| `GET` | `/uploads/:filePath` | public (static) |
| `GET` | `/api/lessons` | any |
| `POST` | `/api/lessons` | teacher |
| `DELETE` | `/api/lessons/:id` | teacher, admin |
| `GET` | `/api/tests` | any |
| `POST` | `/api/tests` | teacher |
| `POST` | `/api/tests/:id/results` | teacher |
| `GET` | `/api/tests/:id/results` | any |
| `GET` | `/api/remarks` | any |
| `POST` | `/api/remarks` | teacher |
| `GET` | `/api/daily-work` | any |
| `POST` | `/api/daily-work` | teacher |
| `PATCH` | `/api/daily-work/:id/complete` | student |
| `GET` | `/api/schedule` | any |
| `POST` | `/api/schedule` | teacher, admin |
| `DELETE` | `/api/schedule/:id` | teacher, admin |
| `GET` | `/api/live-class` | any |
| `PUT` | `/api/live-class/start` | teacher, admin |
| `PUT` | `/api/live-class/end` | teacher, admin |
| `GET` | `/api/notifications` | any |
| `PATCH` | `/api/notifications/:id/read` | any |
| `PATCH` | `/api/notifications/read-all` | any |
| `POST` | `/api/ai/ask` | any |
| `GET` | `/api/ai/insights` | any |

---

## Conventions

### Authentication

Protected routes require:

```http
Authorization: Bearer <token>
```

Obtain the token from `POST /api/auth/login`. JWT claims: `sub` (user id), `role`, `email`, `schoolId`. Default expiry is `7d` (`JWT_EXPIRES_IN`).

Public routes (no token):

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Everything else requires a valid bearer token. Role-restricted routes also check `requireRole`.

### Roles

| Role | Typical access |
|---|---|
| `admin` | School-wide users, fees, finance, inventory, teacher leaves, reports |
| `teacher` | Assigned classes: attendance, lessons, tests, remarks, assignments, parent messages |
| `parent` | Linked children: attendance, results, leaves, fees, teacher messages |
| `student` | Own profile, learning game, assignments, feedback, daily work |

Most data is scoped to the JWT `schoolId` (tenant). Inventory lookups for another school's ids return **404**, not 403, to avoid probing.

### Errors

| Status | Shape | When |
|---|---|---|
| `400` | `{ "error": "Invalid request", "issues": [{ "path", "message" }] }` | Zod validation |
| `400` | `{ "error": "<message>" }` | Business-rule failure |
| `401` | `{ "error": "..." }` | Missing / invalid token or bad login |
| `403` | `{ "error": "You do not have access to this resource" }` | Wrong role |
| `404` | `{ "error": "Endpoint not found" }` or resource message | Unknown path or missing row |
| `409` | `{ "error": "..." }` | Duplicate email / conflict |
| `429` | `{ "error": "Too many attempts, please try again later" }` | Auth rate limit |
| `500` | `{ "error": "Internal server error" }` | Unhandled |

Auth login is rate-limited: **30 requests / 15 minutes** per IP (`/api/auth/*`). AI ask is separately limited: **30 / 15 minutes**.

### Dates and enums

- Calendar dates in bodies/queries are `YYYY-MM-DD`.
- Many Prisma enums are serialized to the frontend in **lowercase** (`present`, `pending`, `cash`). Send lowercase values in request bodies unless noted.
- HTML in remarks and daily work is sanitized server-side.

### Static files

Uploaded files are served without auth as:

```http
GET /uploads/<filePath>
```

The API JSON returns `url` like `/uploads/1710000000-abcd-file.pdf`.

---

## Health

### `GET /api/health`

No auth.

**Response**

```json
{ "ok": true, "service": "kinderguide-server", "time": "2026-09-04T18:00:00.000Z" }
```

---

## Auth — `/api/auth`

### `POST /api/auth/login`

**Body**

| Field | Type | Notes |
|---|---|---|
| `email` | string | min 3 chars |
| `password` | string | |
| `role` | `"teacher" \| "student" \| "parent" \| "admin"` | Must match the credential portal |

**Response** `{ token, user }`

`user` is the role-specific frontend payload (teacher / student / parent / admin). Students never receive `feeAmount` here.

### `GET /api/auth/me`

Auth required. **Response** `{ user }`

### `PUT /api/auth/profile`

Auth required. All fields optional; ignored fields depend on role.

| Field | Roles |
|---|---|
| `name` | all |
| `phone` | teacher, student, parent |
| `avatarUrl` | all (`""` clears) |
| `qualification`, `subject` | teacher |
| `address`, `guardianName` | student |

**Response** `{ user }`

### `PUT /api/auth/change-password`

Auth required.

```json
{ "oldPassword": "...", "newPassword": "at-least-6" }
```

**Response** `{ "ok": true }`

### `POST /api/auth/forgot-password`

Public. Always succeeds with the same message (does not reveal whether the email exists).

```json
{ "email": "user@example.com" }
```

Reset tokens expire in **1 hour**.

### `POST /api/auth/reset-password`

```json
{ "token": "<raw token from email>", "newPassword": "at-least-6" }
```

**Response** `{ "ok": true }`

---

## Bootstrap — `/api/bootstrap`

### `GET /api/bootstrap`

Auth required. Single hydration payload for the frontend `DataContext`. Contents are **role-scoped**:

- Admin: all school students (with fee amounts), teacher attendance, all attendance/results/leaves/remarks.
- Teacher: only own lessons/tests/daily work; students in assigned classes; fee amounts omitted.
- Student: own records only.
- Parent: children only (fee amounts included).

**Response keys:** `admins`, `teachers`, `students`, `parents`, `notifications`, `teacherAttendance`, `lessons`, `tests`, `testResults`, `attendance`, `leaveRequests`, `remarks`, `dailyWork`, `schedules`, `liveClass`.

---

## Admin — `/api/admin`

All routes: **admin** only.

### Dashboard and people

| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard` | Totals (teachers, students, parents, fee due, inventory, low stock) and pending **teacher** leaves |
| `POST` | `/teachers` | Create teacher; issues password; emails credentials |
| `GET` | `/teachers` | All teachers plus derived `todayStatus` |
| `PATCH` | `/teachers/:id` | Update teacher profile / employment |
| `POST` | `/students` | Create student (and parent if needed); emails credentials |
| `GET` | `/students` | All students **with** `feeAmount` |
| `GET` | `/parents` | Parents with child ids |
| `PATCH` | `/students/:id/fee-due` | Toggle `due` boolean; notifies student + parent |
| `POST` | `/students/:id/fee-reminder` | Send fee reminder notifications |
| `POST` | `/users/:id/reset-password` | Body `{ "role": "teacher"\|"student"\|"parent" }`; emails new password |

**Create teacher body**

```json
{
  "name": "Amina Khan",
  "phone": "03001234567",
  "qualification": "AMI diploma",
  "subject": "Practical Life",
  "classes": ["Casa 3-6 A"],
  "personalEmail": "amina@example.com",
  "status": "active",
  "joinDate": "2024-08-01"
}
```

`email` is auto-generated as `name@faculty.kinderguide.com`. Response includes `issued: { role, name, email, password }`. `status`: `active` | `on_leave` | `resigned`.

**Create student body**

```json
{
  "name": "Bilal Ahmed",
  "phone": "03007654321",
  "address": "Lahore",
  "guardianName": "Sara Ahmed",
  "class": "Casa 3-6 A",
  "feeAmount": 15000,
  "personalEmail": "family@example.com",
  "guardianEmail": "optional@parent.kinderguide.com",
  "guardianPhone": "optional"
}
```

If the guardian already exists (same school, email or phone), the student is linked and the parent password is not rotated.

**Fee due body:** `{ "due": true }`

### Teacher leaves (admin review)

| Method | Path | Description |
|---|---|---|
| `GET` | `/leaves?status=pending` | `status`: `pending` \| `accepted` \| `rejected` \| `all` (default `pending`) |
| `PATCH` | `/leaves/:id` | Body `{ "status": "accepted" \| "rejected" }` |

Accepting a leave backfills weekday `leave` attendance for the teacher.

---

## Admin feedback — `/api/admin/feedback`

**Admin.** Identity is visible.

### `GET /api/admin/feedback`

**Response** `{ feedbacks: [{ id, studentId, studentName, teacherId, teacherName, content, readByTeacher, createdAt }] }`

---

## Admin assignments — `/api/admin/assignments`

### `GET /api/admin/assignments`

All assignments with submissions.

---

## Admin teacher reports — `/api/admin/teacher-reports`

### `GET /api/admin/teacher-reports?range=weekly`

`range`: `daily` | `weekly` | `monthly` (default `weekly`).

**Response** `{ range, from, to, reports }` where each report includes present/absent/leave counts, median check-in, lessons uploaded, tests created, remarks posted, leaves applied.

---

## Finance — `/api/admin/finance`

**Admin.**

### `GET /api/admin/finance/payments?studentId=`

Ledger (max 200). Optional `studentId` filter.

### `POST /api/admin/finance/payments`

Creates a receipt, clears `feeDue` on the student, notifies parent and student.

```json
{
  "studentId": "...",
  "amount": 15000,
  "method": "cash",
  "term": "Sep 2026",
  "note": "optional"
}
```

`method`: `cash` | `bank_transfer` | `jazzcash` | `easypaisa`.

**Response** `201` `{ payment, feeDue: false }`

### `GET /api/admin/finance/summary`

Six-month income buckets, totals, outstanding fee counts/amounts, average fee, totals by payment method.

---

## Inventory — `/api/admin/inventory`

**Admin.** Quantity changes **must** go through `/move` (PATCH cannot set quantity).

| Method | Path | Description |
|---|---|---|
| `GET` | `/items?search=&category=` | Stock list (max 300) + `lowStockCount` |
| `GET` | `/low-stock` | Items at or below `minStock` |
| `POST` | `/items` | Create item; opening quantity logged as `stock_in` |
| `PATCH` | `/items/:id` | Name, category, minStock, unit, location (not quantity) |
| `POST` | `/items/:id/move` | Adjust stock |
| `GET` | `/movements?itemId=` | History (max 100) |

**Create item**

```json
{
  "name": "A4 paper",
  "category": "stationery",
  "quantity": 20,
  "minStock": 5,
  "unit": "ream",
  "location": "Store A"
}
```

`category`: `stationery` | `cleaning` | `sports` | `furniture` | `medical` | `other`.

**Move**

```json
{ "type": "stock_out", "quantity": 2, "note": "Classroom" }
```

`type`: `stock_in` (add), `stock_out` (subtract; fails if insufficient), `adjust` (set absolute quantity).

---

## Teacher — `/api/teachers`

**Teacher.**

| Method | Path | Description |
|---|---|---|
| `GET` | `/today-status` | Derived status + check-in time |
| `POST` | `/mark-present` | Upsert today's present + check-in `HH:mm` |
| `POST` | `/apply-leave` | Teacher leave request |
| `GET` | `/my-leaves` | Own leave history |
| `GET` | `/students?class=` | Roster for taught classes; **no fee amounts** |
| `POST` | `/attendance` | Batch roll call |
| `GET` | `/attendance?class=&date=` | Records for date (default today) |
| `GET` | `/student-leaves?status=` | Student leaves for taught classes |
| `PATCH` | `/student-leaves/:id` | `{ "status": "accepted" \| "rejected" }` |

**Apply leave**

```json
{ "fromDate": "2026-09-08", "toDate": "2026-09-10", "reason": "Family" }
```

**Roll call**

```json
{
  "records": [
    { "studentId": "...", "date": "2026-09-04", "status": "present" }
  ]
}
```

`status`: `present` | `absent` | `leave` | `holiday`. Absences notify the student and parent.

Teacher `todayStatus` is derived: present mark → `present`; approved leave covering today → `leave`; weekday otherwise → `absent`; weekend → `null`.

---

## Teacher messages — `/api/teachers/messages`

**Teacher.**

| Method | Path | Description |
|---|---|---|
| `GET` | `/threads` | Threads keyed by parent |
| `GET` | `/contacts` | Parents of students in the teacher's classes |
| `GET` | `/:parentId` | Messages; marks parent messages read |
| `POST` | `/:parentId` | Body `{ "content": "..." }` (max 2000) |

Declare `/contacts` before `/:parentId` in clients the same way the server does: call contacts as that exact path.

---

## Teacher feedback — `/api/teachers/feedback`

**Teacher.** Student identity is **stripped**.

### `GET /api/teachers/feedback`

`{ feedbacks: [{ id, content, readByTeacher, createdAt }] }`

### `PATCH /api/teachers/feedback/:id/read`

Marks read. Same anonymous shape.

---

## Teacher assignments — `/api/teachers/assignments`

**Teacher.**

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Create assignment; notifies class students |
| `GET` | `/` | Own assignments + submissions |
| `DELETE` | `/:id` | Delete own assignment |
| `GET` | `/:id/submissions` | Assignment + submissions |
| `PATCH` | `/submissions/:id/grade` | Grade 0–100 |

**Create**

```json
{
  "title": "Phonogram practice",
  "class": "Casa 3-6 A",
  "subject": "Language",
  "instructions": "Trace the cards",
  "dueAt": "2026-09-10T15:00:00.000Z"
}
```

Class must be in the teacher's `classes` list.

**Grade** `{ "grade": 85, "feedback": "optional" }` — notifies the student.

---

## Teacher streaks — `/api/teachers/streaks`

### `GET /api/teachers/streaks`

Per-student streak, XP, level, badge count, `atRisk` if they had a streak but did not play today.

---

## Student — `/api/students`

**Student.**

| Method | Path | Description |
|---|---|---|
| `GET` | `/me` | Profile without fee amount |
| `GET` | `/my-attendance` | Own attendance |
| `GET` | `/my-results` | Own test results |
| `GET` | `/my-leaves` | Own leave requests |

---

## Student feedback — `/api/students/feedback`

**Student.** Identity is stored for admin, hidden from the teacher.

### `POST /api/students/feedback`

```json
{ "teacherId": "...", "content": "..." }
```

Content 3–2000 chars. Notifies the teacher as anonymous.

### `GET /api/students/feedback/mine`

Own submissions (includes identity fields for the student).

---

## Student assignments — `/api/students/assignments`

**Student.**

### `GET /api/students/assignments`

Assignments for the student's class + their submissions.

### `POST /api/students/assignments/:id/submit`

```json
{ "text": "optional", "fileName": "work.pdf", "filePath": "stored-filename" }
```

Provide `text` and/or `filePath` (from upload). Late submissions set `isLate`. Upserts one submission per student per assignment. Notifies the teacher.

---

## Student learning — `/api/students/learning`

**Student.** Daily quiz: 6 questions, 30 seconds each, 10 XP per correct, +20 XP if perfect. One completion per calendar day. Level = `floor(totalXp / 100) + 1`.

### `GET /api/students/learning/daily`

Questions **without** correct answers. Includes `todayCompleted` and `todayResult` if already submitted.

### `POST /api/students/learning/submit`

```json
{ "answers": [0, 2, 1, 0, 3, 1], "durationSec": 120 }
```

`answers` length must match the daily task. Repeat submit returns `{ alreadyCompleted: true, ... }` without changing scores.

### `GET /api/students/learning/progress`

Streaks, XP, level, badges, last 14 sessions.

---

## Parent — `/api/parents`

**Parent.** Child ids in path must belong to the parent or the API returns 400.

| Method | Path | Description |
|---|---|---|
| `GET` | `/me` | Parent + child ids |
| `GET` | `/children` | Children **with** fee amounts |
| `POST` | `/apply-leave` | Leave for a linked child |
| `GET` | `/children/:id/attendance` | |
| `GET` | `/children/:id/results` | |
| `GET` | `/children/:id/leaves` | |
| `GET` | `/finance` | Child fee snapshot + payment receipts |

**Apply leave**

```json
{
  "studentId": "...",
  "fromDate": "2026-09-08",
  "toDate": "2026-09-09",
  "reason": "Appointment"
}
```

Student leaves are reviewed by the **class teacher**, not admin.

---

## Parent messages — `/api/parents/messages`

**Parent.**

| Method | Path | Description |
|---|---|---|
| `GET` | `/threads` | Threads keyed by teacher |
| `GET` | `/:teacherId` | Conversation; marks teacher messages read |
| `POST` | `/:teacherId` | `{ "content": "..." }` |

---

## Upload — `/api/upload`

### `POST /api/upload`

Auth required (any role). `multipart/form-data` field name: **`file`**. Max **25 MB**.

Do **not** send `Content-Type: application/json`.

**Response**

```json
{
  "fileName": "homework.pdf",
  "filePath": "1710000000-a1b2c3d4-homework.pdf",
  "url": "/uploads/1710000000-a1b2c3d4-homework.pdf",
  "size": 12345
}
```

Use `filePath` when submitting assignments.

---

## Lessons — `/api/lessons`

Auth required to list. Create/delete restricted.

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/?class=` | any | School lessons |
| `POST` | `/` | teacher | Create |
| `DELETE` | `/:id` | teacher, admin | Teacher may only delete own |

**Create** — require `youtubeId` **or** `videoUrl`:

```json
{
  "title": "Pouring",
  "subject": "Practical Life",
  "class": "Casa 3-6 A",
  "youtubeId": "dQw4w9wg",
  "description": "...",
  "notes": "optional",
  "duration": "8 min"
}
```

---

## Tests — `/api/tests`

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/?class=` | any | Tests for the school |
| `POST` | `/` | teacher | Create milestone |
| `POST` | `/:id/results` | teacher | Batch results; sets test `evaluated` |
| `GET` | `/:id/results` | any (school-scoped) | |

**Create**

```json
{
  "title": "Sensorial check",
  "subject": "Sensorial",
  "class": "Casa 3-6 A",
  "date": "2026-09-15",
  "maxMarks": 20,
  "instructions": "Observe independently"
}
```

**Results**

```json
{
  "results": [
    {
      "studentId": "...",
      "marksObtained": 16,
      "grade": "A",
      "milestoneStatus": "Mastered",
      "teacherComment": "optional"
    }
  ]
}
```

`grade`: `A+` | `A` | `B` | `C` | `D` | `F`. `milestoneStatus`: `Mastered` | `Developing` | `Emerging`. `marksObtained` cannot exceed `maxMarks`.

---

## Remarks — `/api/remarks`

| Method | Path | Roles |
|---|---|---|
| `GET` | `/?studentId=` | any (school-scoped) |
| `POST` | `/` | teacher |

**Create** `{ "studentId", "content", "type" }` with `type`: `positive` | `constructive` | `concern`. Notifies the parent.

---

## Daily work — `/api/daily-work`

| Method | Path | Roles |
|---|---|---|
| `GET` | `/?class=` | any |
| `POST` | `/` | teacher |
| `PATCH` | `/:id/complete` | student |

**Create**

```json
{
  "class": "Casa 3-6 A",
  "content": "<p>Today we practiced pouring.</p>",
  "attachmentName": "optional.pdf",
  "visibleTo": ["students", "parents"]
}
```

`visibleTo` is a non-empty subset of `students` | `parents`. Complete toggles the current student on `completedByStudentIds`.

---

## Schedule — `/api/schedule`

| Method | Path | Roles |
|---|---|---|
| `GET` | `/?class=` | any |
| `POST` | `/` | teacher, admin |
| `DELETE` | `/:id` | teacher, admin |

**Create**

```json
{
  "title": "Circle time",
  "category": "circle_time",
  "startTime": "09:00",
  "endTime": "09:30",
  "class": "Casa 3-6 A",
  "teacherName": "Amina Khan",
  "description": "Greeting and songs",
  "roomOrLink": "Room 1",
  "isLive": false
}
```

`category`: `circle_time` | `phonics` | `sensorial` | `math` | `snack_break` | `art_craft` | `outdoor_play` | `storytelling` | `live_class`.

---

## Live class — `/api/live-class`

One session row per school (upsert).

| Method | Path | Roles |
|---|---|---|
| `GET` | `/` | any |
| `PUT` | `/start` | teacher, admin |
| `PUT` | `/end` | teacher, admin |

**Start**

```json
{
  "topic": "Sandpaper letters",
  "subject": "Language",
  "class": "Casa 3-6 A",
  "teacherName": "optional"
}
```

Notifies students in that class and their parents.

---

## Notifications — `/api/notifications`

Auth required. Returns the current user's inbox (max 50).

| Method | Path |
|---|---|
| `GET` | `/` |
| `PATCH` | `/:id/read` |
| `PATCH` | `/read-all` |

---

## AI — `/api/ai`

Auth required. Insights and answers are **role-scoped** to the caller.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/ask` | Body `{ "question": "..." }` (1–500 chars). Rate limit 30 / 15 min |
| `GET` | `/insights` | Dashboard-style insights |

**Ask response** `{ "answer": "..." }`

Without `AI_API_KEY`, the server still answers from local analytics/intents; LLM classification is optional.

---

## Example: login then fetch dashboard

```bash
TOKEN=$(curl -s http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kinderguide.com","password":"admin123","role":"admin"}' \
  | jq -r .token)

curl -s http://localhost:4000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

Demo accounts are listed in the root `README.md`.

---

## Route map (mount points)

| Prefix | Module |
|---|---|
| `/api/health` | `index.ts` |
| `/api/auth` | `routes/auth.ts` |
| `/api/bootstrap` | `routes/bootstrap.ts` |
| `/api/admin/feedback` | `routes/feedback.ts` |
| `/api/admin/assignments` | `routes/assignments.ts` |
| `/api/admin/teacher-reports` | `routes/teacher-reports.ts` |
| `/api/admin/finance` | `routes/finance.ts` |
| `/api/admin/inventory` | `routes/inventory.ts` |
| `/api/admin` | `routes/admin.ts` |
| `/api/teachers/messages` | `routes/messages.ts` |
| `/api/teachers/feedback` | `routes/feedback.ts` |
| `/api/teachers/assignments` | `routes/assignments.ts` |
| `/api/teachers/streaks` | `routes/learning.ts` |
| `/api/teachers` | `routes/teacher.ts` |
| `/api/students/feedback` | `routes/feedback.ts` |
| `/api/students/assignments` | `routes/assignments.ts` |
| `/api/students/learning` | `routes/learning.ts` |
| `/api/students` | `routes/families.ts` |
| `/api/parents/messages` | `routes/messages.ts` |
| `/api/parents` | `routes/families.ts` |
| `/api/upload` | `routes/upload.ts` |
| `/api/lessons` | `routes/academic.ts` |
| `/api/tests` | `routes/academic.ts` |
| `/api/remarks` | `routes/academic.ts` |
| `/api/daily-work` | `routes/academic.ts` |
| `/api/schedule` | `routes/academic.ts` |
| `/api/live-class` | `routes/academic.ts` |
| `/api/notifications` | `routes/notifications.ts` |
| `/api/ai` | `routes/ai.ts` |
