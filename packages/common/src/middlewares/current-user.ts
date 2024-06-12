import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ClientRoles } from '../types';
export interface ClientRoles {
  OPERATOR: string;
  HIPAL_ADMIN: string;
  HIPAL_CUSTOMER: string;
  RESTAURANT_OWNER: string;
  RESTAURANT_MANAGER: string;
  RESTAURANT_FLOOR_MANAGER: string;
}
interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: ClientRoles;
  org: string;
}

declare global {
  namespace Express {
    interface Request {
      current_User?: UserPayload;
    }
  }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    req.current_User = payload;
  } catch (err) {}

  next();
};
