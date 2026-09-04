import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SMTP_USER: z.string().email().default(''),
  SMTP_APP_PASSWORD: z.string().default(''),
  EMAIL_FROM: z.string().default('KinderGuide'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  AI_API_KEY: z.string().default(''),
  AI_API_BASE: z.string().default('https://api.openai.com/v1'),
  AI_MODEL: z.string().default('gpt-4o-mini'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parsed.data;
export const emailEnabled = config.SMTP_USER.length > 0 && config.SMTP_APP_PASSWORD.length > 0;
export const aiLlmEnabled = config.AI_API_KEY.length > 0;
