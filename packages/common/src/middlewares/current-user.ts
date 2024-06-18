import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export enum ClientRoles {
  OPERATOR = 'OPERATOR',
  HIPAL_ADMIN = 'HIPAL_ADMIN',
  HIPAL_CUSTOMER = 'HIPAL_CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  RESTAURANT_MANAGER = 'RESTAURANT_MANAGER',
  RESTAURANT_FLOOR_MANAGER = 'RESTAURANT_FLOOR_MANAGER',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
}

// id: user.id,
//       email: user.email,
//       name: user.name,
//       phone: user.phone,
//       role: user.role,
//       customRole: user.customRole,

interface UserPayload {
  id: string;
  role: ClientRoles;
  phone: string;
  accessControl: {};
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  next();
};
