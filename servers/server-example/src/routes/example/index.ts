// books.ts
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const exampleRouter = new Hono()
  .get('/', (c) => {
    // somehting whcih fails
    c.status(403);
    return c.json({
      message: 'Hello World',
      lol: true,
    });
  })
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        name: z.string(),
      }),
    ),
    (c) =>
      c.json({
        message: 'create a book',
        status: 201,
        error: false,
        data: [],
      }),
  )
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`));

export default exampleRouter;
