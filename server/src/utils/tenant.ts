import type { Request } from 'express';
import { forbidden } from '../utils/errors';

export function schoolOf(req: Request): string {
  if (!req.user?.schoolId) throw forbidden('School context missing from token');
  return req.user.schoolId;
}
