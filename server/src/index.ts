import express from 'express';
import cors from 'cors';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { config } from './config';
import { AppError } from './utils/errors';
import { authRouter } from './routes/auth';
import { adminRouter } from './routes/admin';
import { teacherRouter } from './routes/teacher';
import { studentRouter, parentRouter } from './routes/families';
import {
  lessonRouter, testRouter, remarkRouter, dailyWorkRouter,
  scheduleRouter, liveClassRouter,
} from './routes/academic';
import { notificationRouter } from './routes/notifications';
import { bootstrapRouter } from './routes/bootstrap';
import { studentFeedbackRouter, teacherFeedbackRouter, adminFeedbackRouter } from './routes/feedback';
import { teacherAssignmentRouter, studentAssignmentRouter, adminAssignmentRouter } from './routes/assignments';
import { uploadRouter } from './routes/upload';
import { parentMessageRouter, teacherMessageRouter } from './routes/messages';
import { teacherReportRouter } from './routes/teacher-reports';
import { studentLearningRouter, teacherStreakRouter } from './routes/learning';
import { aiRouter } from './routes/ai';
import { prisma } from './db';

const app = express();

app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kinderguide-server', time: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/bootstrap', bootstrapRouter);
app.use('/api/admin/feedback', adminFeedbackRouter);
app.use('/api/admin/assignments', adminAssignmentRouter);
app.use('/api/admin/teacher-reports', teacherReportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/teachers/messages', teacherMessageRouter);
app.use('/api/teachers/feedback', teacherFeedbackRouter);
app.use('/api/teachers/assignments', teacherAssignmentRouter);
app.use('/api/teachers/streaks', teacherStreakRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/students/feedback', studentFeedbackRouter);
app.use('/api/students/assignments', studentAssignmentRouter);
app.use('/api/students/learning', studentLearningRouter);
app.use('/api/students', studentRouter);
app.use('/api/parents/messages', parentMessageRouter);
app.use('/api/parents', parentRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/lessons', lessonRouter);
app.use('/api/tests', testRouter);
app.use('/api/remarks', remarkRouter);
app.use('/api/daily-work', dailyWorkRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/live-class', liveClassRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/ai', aiRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Express 5 forwards thrown async errors here automatically.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request',
      issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.PORT, () => {
  console.log(`KinderGuide API running on http://localhost:${config.PORT} (${config.NODE_ENV})`);
});

// Warm the Neon connection immediately on startup, then keep it warm every 2
// minutes so the free-tier compute doesn't auto-suspend and cause cold-start
// connection timeouts (Prisma P2024) on the next request.
prisma.$queryRaw`SELECT 1`
  .then(() => console.log('Database connection warm'))
  .catch(() => { /* retried by keep-alive */ });
setInterval(() => {
  prisma.$queryRaw`SELECT 1`.catch(() => { /* keep-alive only */ });
}, 2 * 60 * 1000);
