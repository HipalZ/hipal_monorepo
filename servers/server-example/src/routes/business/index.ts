// books.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const businessRouter = new Hono()
	.get("/", (c) => {
		c.status(403);
		return c.json({
			message: "create a business",
			status: 201,
			error: false,
			data: [],
		});
	})
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				name: z.string(),
			}),
		),
		(c) => c.json("create a book", 201),
	)
	.get("/:id", (c) => c.json(`get ${c.req.param("id")}`));

export default businessRouter;
