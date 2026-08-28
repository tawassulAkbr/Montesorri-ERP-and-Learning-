import type { Request, Response, NextFunction } from 'express';
import { forbidden } from '../utils/errors';
import type { FrontendRole } from './auth';

export function requireRole(...roles: FrontendRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw forbidden('You do not have access to this resource');
    }
    next();
  };
}
