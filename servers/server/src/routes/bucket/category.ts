import { CategoryBucket } from "@hi/db-models";
import {
  categoryBucketSchema,
  updateCategoryBucketSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { respond } from "../../utils/response";
const admin = require("firebase-admin");

const categoryBucketRouter = new Hono()
  .post("add_category", zValidator("json", categoryBucketSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { name, description, isActive } = requestData;

      const bucketAlreadyExists = await CategoryBucket.findOne({
        name: name.trim().toLowerCase(),
      });

      if (bucketAlreadyExists) {
        return respond(c, "Bucket already exists", true, 409, {});
      }
      const newCategoryBucket = new CategoryBucket({
        name: name.trim().toLowerCase(),
        description,
        isActive,
      });

      await newCategoryBucket.save({ session });

      return respond(c, "Category bucket created successfully", false, 201, {
        _id: newCategoryBucket._id,
      });
    });
  })

  .put(
    "update_category",
    zValidator("json", updateCategoryBucketSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { name, description, isActive } = requestData;
        const { categoryBucketId } = requestData;
        const bucketAlreadyExists = await CategoryBucket.findOne({
          name: name.trim().toLowerCase(),
          _id: { $ne: categoryBucketId },
        });
        if (bucketAlreadyExists) {
          return respond(c, "Bucket already exists", true, 409, {});
        }
        const updatedCategoryBucket = await CategoryBucket.findByIdAndUpdate(
          categoryBucketId,
          {
            ...requestData,
          },
          { new: true, session },
        );
        if (!updatedCategoryBucket) {
          return respond(c, "Category bucket not found", true, 404, {});
        }
        return respond(
          c,
          "Category bucket updated successfully",
          false,
          200,
          updatedCategoryBucket,
        );
      });
    },
  )

  .get(
    "fetch_categories",

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const categoryBuckets = await CategoryBucket.find({})
          .select("name")
          .lean();

        return respond(
          c,
          "Category buckets fetched successfully",
          false,
          200,
          categoryBuckets,
        );
      });
    },
  );

export default categoryBucketRouter;
