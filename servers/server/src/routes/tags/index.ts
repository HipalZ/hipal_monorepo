import { TagModel, TagTypeModel, UserTags } from "@hi/db-models";
import { TagSchema, TagTypeSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
const tagRouter = new Hono()
  .post("/tagType", zValidator("json", TagTypeSchema), async (c) => {
    const requestData = await c.req.json();

    const existingTagType = await TagTypeModel.findOne({
      tagType: requestData.tagType,
      isDeleted: false,
    });

    if (existingTagType) {
      return c.json(
        {
          message: "existingTagType already exist",
          err: true,
          data: {},
        },
        409,
      );
    }
    //

    const createTagType = await TagTypeModel.create(requestData);

    if (!createTagType) {
      return c.json(
        {
          message: "createTagType not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "createTagType created successfully",
        err: false,
        data: createTagType,
      },
      201,
    );
  })
  .post("/", zValidator("json", TagSchema), async (c) => {
    const requestData = await c.req.json();

    const existingTag = await TagModel.findOne({
      name: requestData.name,
      businessId: requestData.businessId,
      tagTypeId: requestData.tagTypeId,

      isDeleted: false,
    });

    if (existingTag) {
      return c.json(
        {
          message: "existingTag already subscribed",
          err: true,
          data: {},
        },
        409,
      );
    }

    const createTag = await TagModel.create(requestData);

    if (!createTag) {
      return c.json(
        {
          message: "createTag not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "Tag created successfully",
        err: false,
        data: createTag,
      },
      201,
    );
  })
  .get(
    "/:tagId",
    zValidator(
      "param",
      z.object({
        tagId: z.string({
          message: "tagId is required",
        }),
      }),
    ),
    async (c) => {
      const { tagId } = c.req.param();
      const tag = await TagModel.findOne({
        _id: tagId,
        isDeleted: false,
      });
      if (!tag) {
        return c.json(
          {
            message: "No tag found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "tag found",
          err: false,
          data: tag,
        },
        200,
      );
    },
  )
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
      const tag = await TagModel.find({
        businessId,
        isDeleted: false,
      }).select("name tagTypeId businessId _id tagType");
      return c.json(
        {
          message: "tag found",
          err: false,
          data: tag,
        },
        200,
      );
    },
  )
  .get(
    "/tagType/all",

    async (c) => {
      const tag = await TagTypeModel.find({
        isDeleted: false,
      });
      return c.json(
        {
          message: "tagType found",
          err: false,
          data: tag,
        },
        200,
      );
    },
  )
  .delete(
    "/:tagId",
    zValidator(
      "param",
      z.object({
        tagId: z.string({ message: "tagId is required" }),
      }),
    ),

    async (c) => {
      const { tagId } = c.req.param();
      await TagModel.updateOne(
        {
          _id: tagId,
        },
        { isDeleted: true },
      );
      return c.json(
        {
          message: "tag delete successfully",
          err: false,
          data: {},
        },
        200,
      );
    },
  )
  .put(
    "/update/:userId",
    zValidator(
      "json",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        remainderDate: z
          .number({ message: "remainderDate is required" })
          .optional(),
        tagIds: z.array(z.string({ message: "tagIds is required" })).optional(),

        displayForCaptains: z
          .boolean({ message: "displayForCaptains is required" })
          .optional(),
        noteDescription: z
          .string({ message: "noteDescription is required" })
          .optional(),
        noteTitle: z.string({ message: "noteTitle is required" }).optional(),
        noteUrl: z.string({ message: "noteUrl is required" }).optional(),
      }),
    ),
    zValidator(
      "param",
      z.object({
        userId: z.string({ message: "userId is required" }),
      }),
    ),

    async (c) => {
      const { userId } = c.req.param();
      const requestData = await c.req.json();
      const { tagIds } = requestData;
      const updateTag = await TagModel.updateMany(
        {
          _id: { $in: tagIds },
        },
        requestData,
      );
      if (!updateTag) {
        return c.json(
          {
            message: "tag not updated",
            err: true,
            data: {},
          },
          400,
        );
      }

      for (let i = 0; i < tagIds.length; i++) {
        const updateUserTag = await UserTags.updateMany({
          tagId: tagIds[i],

          userId,
          noteDescription: requestData.noteDescription,
          noteTitle: requestData.noteTitle,
          noteUrl: requestData.noteUrl,

          reminderDate: requestData.remainderDate,
        });
      }

      return c.json(
        {
          message: "tag updated successfully",
          err: false,
          data: updateTag,
        },
        200,
      );
    },
  );

export default tagRouter;
