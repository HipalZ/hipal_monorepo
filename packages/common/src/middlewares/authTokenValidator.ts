import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ClientRoles } from './current-user';

interface UserPayload {
  id: string;
  role: ClientRoles;
  phone: string;
  accessControl: {};
}
interface DecodedToken extends JwtPayload {
  id: string;
}

interface RequestWithUser extends Request {
  currentUser?: UserPayload;
}

// const createAccessToken = (user: any) => {
//   return jwt.sign(
//     {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       phone: user.phone,
//       role: user.role,
//       customRole: user.customRole,
//     },
//     process.env.JWT_SECRET as string,
//     { expiresIn: '1m' }, // Add 7 day expiration
//   );
// };

export const authTokenValidator = async function (request: RequestWithUser, res: Response, next: NextFunction) {
  try {
    const accessToken = request.headers.authorization?.split(' ')[1];
    const refreshToken = request.headers['x-refresh-with'] as string;

    if (!accessToken && !refreshToken) {
      return res.status(401).send({ status: false, error: true, message: 'Invalid Token!' });
    }

    let decodedToken: DecodedToken | undefined;

    jwt.verify(accessToken || 'randomtoken', process.env.JWT_SECRET as string, (err, decoded) => {
      decodedToken = err ? undefined : (decoded as DecodedToken);
      if (err && refreshToken) {
        decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as DecodedToken;
      }
    });

    if (!decodedToken) {
      return res.status(401).send({ status: false, error: true, message: 'Invalid Token!' });
    }

    console.log('decodedToken:', decodedToken);

    if (!request.currentUser) {
      request.currentUser = decodedToken as UserPayload;
    }
    // const newAccessToken = createAccessToken(doesUserExist);

    // res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send({
      status: false,
      error: true,
      message: 'Please login to continue.',
    });
  }
};
