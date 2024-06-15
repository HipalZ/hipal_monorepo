import { NextFunction, Request, Response } from 'express';
import { User } from '../../../db-models';
import { NotAuthorizedError } from '../errors/notAuthorizedError';

interface AccessControl {
  [key: string]: boolean;
  dish: boolean;
}

export const accessLevelGuards = (requiredAccessControl: { [key: string]: boolean }) => {
  const checkAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    const user = await User.findById(req.currentUser.id);
    const userAccessControl = user?.accessControl as AccessControl;

    // Check if all required access control keys are true in userAccessControl
    const isAuthorized = Object.keys(requiredAccessControl).every((key) => requiredAccessControl[key] === true && userAccessControl?.[key] === true);

    if (!isAuthorized) {
      throw new NotAuthorizedError();
    }

    next();
  };
  return checkAuthorization;
};
