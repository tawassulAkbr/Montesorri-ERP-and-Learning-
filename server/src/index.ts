import express from 'express';
import cors from 'cors';
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

const app = express();

app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json({ limit: '1mb' }));

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
app.use('/api/admin', adminRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/students', studentRouter);
app.use('/api/parents', parentRouter);
app.use('/api/lessons', lessonRouter);
app.use('/api/tests', testRouter);
app.use('/api/remarks', remarkRouter);
app.use('/api/daily-work', dailyWorkRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/live-class', liveClassRouter);
app.use('/api/notifications', notificationRouter);

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
