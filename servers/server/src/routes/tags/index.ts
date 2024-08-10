import { Note, TagModel, TagTypeModel, User, UserTags } from "@hi/db-models";
import { TagSchema, noteSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { schedule } from "node-cron";
import { z } from "zod";
const tagRouter = new Hono()

  .post("/", zValidator("json", TagSchema), async (c) => {
    const requestData = await c.req.json();

    const existingTag = await TagModel.findOne({
      name: requestData.name,
      businessId: requestData.businessId,

      isDeleted: false,
    });

    if (existingTag) {
      return c.json(
        {
          message: "existingTag already exist",
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
      }).select(
        "name businessId _id tagType duration displayForCaptains remainderInDuration time note",
      );
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
    "/:tagId/:userId",
    zValidator(
      "param",
      z.object({
        tagId: z.string({ message: "tagId is required" }),
        userId: z.string({ message: "userId is required" }).optional(),
      }),
    ),

    async (c) => {
      const { tagId, userId } = c.req.param();
      await TagModel.updateOne(
        {
          _id: tagId,
        },
        { isDeleted: true },
      );
      await UserTags.deleteMany({
        tagId,
        userId,
      });
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

      const date = Date.now();
      const customDate = new Date(date).setHours(0, 0, 0, 0);

      const user = await User.findById(userId).select("phone name");

      for (let i = 0; i < tagIds.length; i++) {
        const tag = await TagModel.findById(tagIds[i]).select("duration time");
        console.log("tag", tag);
        const updateUserTag = await UserTags.findOneAndUpdate(
          {
            tagId: tagIds[i],
            userId,
          },
          {
            $set: {
              noteDescription: requestData.noteDescription,
              noteTitle: requestData.noteTitle,
              businessId: requestData.businessId,
              noteUrl: requestData.noteUrl,
              date: Date.now(),
              reminderDate:
                requestData.remainderDate ||
                customDate + tag?.duration + tag?.time,
            },
          },
          { upsert: true, new: true }, // Ensure upsert is true and return the updated document
        );
        const reminderDateObj = new Date(updateUserTag.reminderDate);
        const cronExpression = `${reminderDateObj.getMinutes()} ${reminderDateObj.getHours()} ${reminderDateObj.getDate()} ${
          reminderDateObj.getMonth() + 1
        } *`;

        schedule(cronExpression, async () => {
          const options = {
            method: "POST",
            url: "https://control.msg91.com/api/v5/flow/",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              authkey: "387796AmyGlDBq63b2d75aP1",
            },
            data: {
              template_id: "66b1f189d6fc055e463e3b63",
              sender: "HiPalc",
              mobiles: `91${user.phone}`,
              var: `${user.name}`,
            },
          };
          await axios(options);
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
  )
  .post("/note", zValidator("json", noteSchema), async (c) => {
    const requestData = await c.req.json();

    const createNote = await Note.create(requestData);

    if (!createNote) {
      return c.json(
        {
          message: "createNote not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json({
      message: "Note created successfully",
      err: false,
      data: createNote,
    });
  })
  .get(
    "/note/:businessId/:userId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        userId: z.string({ message: "userId is required" }),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.param();
      const note = await Note.find({
        businessId,
        userId,
      });
      return c.json({
        message: "note found",
        err: false,
        data: note,
      });
    },
  )
  .put("/note/:noteId", zValidator("json", noteSchema.partial()), async (c) => {
    const requestData = await c.req.json();

    const createNote = await Note.findByIdAndUpdate(
      c.req.param().noteId,
      requestData,
      { new: true },
    );

    if (!createNote) {
      return c.json(
        {
          message: "createNote not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json({
      message: "Note updated successfully",
      err: false,
      data: createNote,
    });
  })
  .delete("/note/:noteId", async (c) => {
    const { noteId } = c.req.param();

    const createNote = await Note.findByIdAndDelete(noteId);

    if (!createNote) {
      return c.json(
        {
          message: "createNote not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json({
      message: "Note updated successfully",
      err: false,
      data: createNote,
    });
  });

export default tagRouter;
