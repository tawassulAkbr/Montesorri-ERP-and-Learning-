import express from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma, generateToken } from '../auth';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2), // Tenant name for onboarding
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register a new tenant and super admin
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.create({
      data: {
        name,
        users: {
          create: {
            email,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
          }
        }
      },
      include: {
        users: true,
      }
    });

    const user = tenant.users[0];
    const token = generateToken(user.id, user.role, tenant.id);

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, tenantId: tenant.id } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role, user.tenantId);

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
