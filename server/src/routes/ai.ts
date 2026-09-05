import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { answerQuestion, buildInsights } from '../services/ai/intents';

export const aiRouter = Router();
aiRouter.use(requireAuth);

const askLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many AI requests, please try again later' },
});

const askSchema = z.object({
  question: z.string().trim().min(1).max(500),
});

aiRouter.post('/ask', askLimiter, async (req, res) => {
  const { question } = askSchema.parse(req.body);
  const answer = await answerQuestion(req.user!, question);
  res.json({ answer });
});

aiRouter.get('/insights', async (req, res) => {
  const insights = await buildInsights(req.user!);
  res.json({ insights });
});
