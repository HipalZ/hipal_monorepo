import { HTTPException } from 'hono/http-exception';

export const customTimeoutException = () =>
  new HTTPException(408, {
    message: `Request timeout after waiting ${Bun.env.TIMEOUT} seconds. Please try again later.`,
  });
