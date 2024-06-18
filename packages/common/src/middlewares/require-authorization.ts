import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '../errors/notAuthorizedError';

export enum ClientRoles {
  OPERATOR = 'OPERATOR',
  HIPAL_ADMIN = 'HIPAL_ADMIN',
  HIPAL_CUSTOMER = 'HIPAL_CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  RESTAURANT_MANAGER = 'RESTAURANT_MANAGER',
  RESTAURANT_FLOOR_MANAGER = 'RESTAURANT_FLOOR_MANAGER',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
}
// ! Assumes we are going to call current Client before this middleware
export const requireAuthorization = (roles: ClientRoles[]) => {
  const checkAuthorization = (req: Request, res: Response, next: NextFunction) => {
    //TODO: ADD A CHECK FOR LOCALHOST
    if (req.hostname !== 'localhost') {
      return res.status(401).send({ message: 'Invalid Domain' });
    }
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    const exists = roles.includes(req.currentUser?.role as ClientRoles);
    if (!exists) {
      return res.status(401).send({ message: 'Access Denied !' });
    }

    next();
  };
  return checkAuthorization;
};
