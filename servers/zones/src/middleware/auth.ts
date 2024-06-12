import { User } from '@hi/db-models';
import { UserType } from '@hi/db-models/src/validators';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  id: string;
}

interface RequestWithUser extends Request {
  user?: UserType;
}

export const auth = async function (request: RequestWithUser, res: Response, next: NextFunction) {
  try {
    const accessToken = request.headers.authorization?.split(' ')[1];
    const refreshToken = request.headers['x-refresh-with'] as string;

    if (!accessToken && !refreshToken) {
      return res.status(401).send({ status: false, error: true, message: 'Invalid Token!' });
    }

    let decodedToken: DecodedToken | undefined;

    jwt.verify(accessToken || 'randomtoken', process.env.JWT_SECRET as string, (err, decoded) => {
      console.log('err', err, 'decoded', decoded);
      decodedToken = err ? undefined : (decoded as DecodedToken);
      if (err && refreshToken) {
        decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as DecodedToken;
      }
    });

    if (!decodedToken) {
      return res.status(401).send({ status: false, error: true, message: 'Invalid Token!' });
    }

    const userId = decodedToken.id;
    const doesUserExist = await User.findOne({ _id: userId }).lean({ autopopulate: true }).select('-password');

    if (!doesUserExist) {
      return res.status(401).send({ status: false, error: true, message: 'Invalid User!' });
    }

    request.user = { ...doesUserExist };
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
