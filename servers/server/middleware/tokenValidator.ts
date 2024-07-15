import type { Context, Next } from 'hono';

import type { JwtPayload } from 'jsonwebtoken';
//@ts-ignore
import jwt from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  id: string;
}

export const authTokenValidator = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader ? authHeader.split(' ')[1] : null;

  const refreshToken = c.req.header('x-refresh-token');
  console.log("headers", c.req.header());

  if (!accessToken && !refreshToken) {
    return c.json({ status: false, error: true, message: 'Invalid Token!' }, 401);
  }

  let decodedToken: DecodedToken | undefined;

  jwt.verify(accessToken || 'randomtoken', Bun.env.JWT_SECRET, (err: Error, decoded: JwtPayload) => {
    if (err && refreshToken) {
      try {
        decodedToken = jwt.verify(refreshToken, Bun.env.JWT_SECRET) as DecodedToken;
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
};
