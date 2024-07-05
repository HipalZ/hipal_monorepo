import type { Context, Next } from 'hono';

import type { JwtPayload } from 'jsonwebtoken';
//@ts-ignore
import jwt from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  id: string;
}

export const authTokenValidator = async (c: Context, next: Next) => {
  try {
    const accessToken = c.req.header('x-access-token');
    const refreshToken = c.req.header('x-refresh-token');

    if (!accessToken && !refreshToken) {
      return c.json({ status: false, error: true, message: 'Invalid Token!' }, 401);
    }

    let decodedToken: DecodedToken | undefined;

    jwt.verify(accessToken || 'randomtoken', Bun.env.JWT_SECRET as string, (err: Error, decoded: JwtPayload) => {
      if (err && refreshToken) {
        try {
          decodedToken = jwt.verify(refreshToken, Bun.env.JWT_SECRET as string) as DecodedToken;
        } catch (refreshErr) {
          return c.json({ status: false, error: true, message: 'Invalid Token!' }, 401);
        }
      } else if (!err) {
        decodedToken = decoded as DecodedToken;
      }
    });

    if (!decodedToken) {
      return c.json({ status: false, error: true, message: 'Invalid Token!' }, 401);
    }

    c.set('current_user', decodedToken);

    await next();
  } catch (error) {
    console.error(error);
    return c.json({ status: false, error: true, message: 'Please login to continue.' }, 401);
  }
};
