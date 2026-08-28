import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { signToken, requireAuth } from '../middleware/auth';
import { verifyPassword, hashPassword } from '../services/password';
import { generateResetToken, hashToken } from '../services/reset-token';
import { sendPasswordResetEmail } from '../services/mail';
import { badRequest, unauthorized, notFound } from '../utils/errors';
import { adminToFrontend, parentToFrontend, studentToFrontend, teacherToFrontend } from '../utils/serializers';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
  role: z.enum(['teacher', 'student', 'parent', 'admin']),
});

async function buildUserPayload(userId: string, role: 'teacher' | 'student' | 'parent' | 'admin') {
  if (role === 'teacher') {
    const t = await prisma.teacher.findUnique({ where: { id: userId } });
    return t ? teacherToFrontend(t) : null;
  }
  if (role === 'student') {
    const s = await prisma.student.findUnique({ where: { id: userId } });
    // Fee amounts are admin-only — excluded from the student's own profile.
    return s ? studentToFrontend(s, { includeFeeAmount: false }) : null;
  }
  if (role === 'parent') {
    const p = await prisma.parent.findUnique({
      where: { id: userId },
      include: { children: { select: { id: true } } },
    });
    return p ? parentToFrontend(p, p.children.map(c => c.id)) : null;
  }
  const a = await prisma.admin.findUnique({ where: { id: userId } });
  return a ? adminToFrontend(a) : null;
}

authRouter.post('/login', async (req, res) => {
  const { email, password, role } = loginSchema.parse(req.body);
  const cred = await prisma.credential.findUnique({ where: { email: email.toLowerCase() } });
  if (!cred || cred.role !== (role.toUpperCase() as typeof cred.role)) {
    throw unauthorized('Invalid credentials for this portal');
  }
  const ok = await verifyPassword(password, cred.passwordHash);
  if (!ok) {
    throw unauthorized('Invalid credentials for this portal');
  }
  const user = await buildUserPayload(cred.userId, role);
  if (!user) {
    throw unauthorized('Account record not found');
  }
  const token = signToken({ sub: cred.userId, role, email: cred.email });
  res.json({ token, user });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await buildUserPayload(req.user!.id, req.user!.role);
  if (!user) throw notFound('Account record not found');
  res.json({ user });
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

authRouter.put('/change-password', requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
  const cred = await prisma.credential.findUnique({ where: { email: req.user!.email } });
  if (!cred) throw notFound('Credential not found');
  const ok = await verifyPassword(oldPassword, cred.passwordHash);
  if (!ok) throw badRequest('Current password is incorrect');
  await prisma.credential.update({
    where: { id: cred.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  res.json({ ok: true });
});

const forgotSchema = z.object({ email: z.string().min(3) });

authRouter.post('/forgot-password', async (req, res) => {
  const { email } = forgotSchema.parse(req.body);
  const cred = await prisma.credential.findUnique({ where: { email: email.toLowerCase() } });
  // Always respond success to avoid revealing which emails exist.
  if (cred) {
    const { raw, hash } = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: cred.userId,
        role: cred.role,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendPasswordResetEmail(cred.email, raw);
  }
  res.json({ ok: true, message: 'If that email exists, a reset link has been sent.' });
});

const resetSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = resetSchema.parse(req.body);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw badRequest('Reset link is invalid or has expired');
  }
  const cred = await prisma.credential.findFirst({
    where: { userId: record.userId, role: record.role },
  });
  if (!cred) throw notFound('Credential not found');
  await prisma.$transaction([
    prisma.credential.update({
      where: { id: cred.id },
      data: { passwordHash: await hashPassword(newPassword) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  res.json({ ok: true });
});
