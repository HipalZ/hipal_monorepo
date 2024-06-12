import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '../errors/notAuthorizedError';
import { ClientRoles } from '../types';
export interface ClientRoles {
  OPERATOR: string;
  HIPAL_ADMIN: string;
  HIPAL_CUSTOMER: string;
  RESTAURANT_OWNER: string;
  RESTAURANT_MANAGER: string;
  RESTAURANT_FLOOR_MANAGER: string;
}
// ! Assumes we are going to call current Client before this middleware
export const requireAuthorization = (roles: ClientRoles[]) => {
  const checkAuthorization = (req: Request, res: Response, next: NextFunction) => {
    if (req.hostname === 'hipal.life' && req.method === 'GET') {
      next();
    }
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    const exists = roles.includes(req.current_User?.role as ClientRoles);
    if (!exists) {
      throw new NotAuthorizedError();
    }

    next();
  };
  return checkAuthorization;
};
