import { NextFunction, Request, Response } from 'express';
import { User } from '../../../db-models';

interface AccessControl {
  [key: string]: boolean;
  dish: boolean;
}

export const accessLevelGuards = (requiredAccessControl: { [key: string]: boolean }) => {
  const checkAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).send({ message: 'Not Authorized' });
    }

    const user = await User.findById(req.currentUser.id);
    const userAccessControl = user?.customRole && (user?.customRole[0].accessControl as AccessControl);

    // Check if all required access control keys are true in userAccessControl
    const isAuthorized = Object.keys(requiredAccessControl).every((key) => requiredAccessControl[key] === true && userAccessControl?.[key] === true);

    if (!isAuthorized) {
      return res.status(401).send({ message: 'Access Denied !' });
    }

    next();
  };
  return checkAuthorization;
};
