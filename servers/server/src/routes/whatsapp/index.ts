import { Hono } from "hono";

const whatsappRouter = new Hono().get("/", async (c) => {
  return c.json(
    {
      message: "Welcome to WhatsApp API",
      err: false,
      data: {},
    },
    200,
  );
});

export default whatsappRouter;
