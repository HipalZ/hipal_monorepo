import type { Context } from 'hono';

function respond(c: Context, message: string, err: boolean, statusCode: number, data: object = {}) {
  const response = {
    err: err,
    data,
    message: message,
  };
  return c.json(response, { status: statusCode });
}

export { respond };
