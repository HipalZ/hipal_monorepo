import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '../errors/notAuthorizedError';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.hostname === 'hipal.life' && req.method === 'GET') {
    next();
  }
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};
