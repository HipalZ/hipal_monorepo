import { GroupModel } from "@hi/db-models";
import { groupSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
const groupRouter = new Hono()
  .post("/", zValidator("json", groupSchema), async (c) => {
    const requestData = await c.req.json();
    const { businessId } = requestData;
    const existingGroup = await GroupModel.findOne({
      businessId,
      name: requestData.name,
      isDeleted: false,
    });

    if (existingGroup) {
      return c.json(
        {
          message: "Group already subscribed",
          err: true,
          data: {},
        },
        409,
      );
    }

    const createGroup = await GroupModel.create(requestData);

    if (!createGroup) {
      return c.json(
        {
          message: "Group not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "Group created successfully",
        err: false,
        data: createGroup,
      },
      201,
    );
  })
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string({
          message: "businessId is required",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const groups = await GroupModel.find({ businessId, isDeleted: false });
      return c.json(
        {
          message: "Groups found",
          err: false,
          data: groups,
        },
        200,
      );
    },
  )
  .get(
    "/:groupId",
    zValidator(
      "param",
      z.object({
        groupId: z.string({
          message: "groupId is required",
        }),
      }),
    ),
    async (c) => {
      const { groupId } = c.req.param();
      const group = await GroupModel.findOne({
        _id: groupId,
        isDeleted: false,
      });
      if (!group) {
        return c.json(
          {
            message: "No group found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "Group found",
          err: false,
          data: group,
        },
        200,
      );
    },
  )
  .delete(
    "/:groupId",
    zValidator(
      "param",
      z.object({
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { groupId } = c.req.param();
      await GroupModel.updateOne(
        {
          _id: groupId,
        },
        { isDeleted: true },
      );
      return c.json(
        {
          message: "group delete successfully",
          err: false,
          data: {},
        },
        200,
      );
    },
  )
  .put(
    "/:groupId",
    zValidator("json", groupSchema.partial()),
    zValidator(
      "param",
      z.object({
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { groupId } = c.req.param();
      const requestData = await c.req.json();
      const updateGroup = await GroupModel.findByIdAndUpdate(
        groupId,
        requestData,
      );
      return c.json(
        {
          message: "Group updated successfully",
          err: false,
          data: updateGroup,
        },
        200,
      );
    },
  )
  .post(
    "/addUsers",

    zValidator(
      "json",
      z.object({
        groupId: z.string({ message: "groupId is required" }),
        userIds: z.array(z.string({ message: "userIds is required" })),
      }),
    ),

    async (c) => {
      const { groupId, userIds } = await c.req.json();
      const group = await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        {
          $addToSet: { userIds: { $each: userIds } },
        },
        { new: true },
      );

      return c.json(
        {
          message: "Users added to group",
          err: false,
          data: group,
        },
        200,
      );
    },
  );

export default groupRouter;
