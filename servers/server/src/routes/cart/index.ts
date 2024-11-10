import { Hono } from "hono";
//
const cartRouter = new Hono().get(
  "/",

  // zValidator("param",z.object({
  //     id: z.string(),
  // })),
  // zValidator("query",z.object({
  //     id: z.string(),
  // })),
  // zValidator("json",z.object({
  //     id: z.string(),
  // })),

  async (c) => {
    return c.json(
      {
        message: "testing cart",
        err: false,
        data: {},
      },
      200,
    );
  },
);

export default cartRouter;
