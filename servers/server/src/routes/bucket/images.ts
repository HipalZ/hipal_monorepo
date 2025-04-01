import { CategoryBucket, Image } from "@hi/db-models";
import { imagesSchema, updateImagesSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { respond } from "../../utils/response";
const admin = require("firebase-admin");

const imageBucketRouter = new Hono()
  .post("add_images", zValidator("json", imagesSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      const { name, description, isActive } = requestData;

      const createImage = new Image({
        name: name.trim().toLowerCase(),
        description,
        isActive,
        tagIds: requestData.tagIds,
        categoryBucketId: requestData.categoryBucketId,
        imageUrl: requestData.imageUrl,
      });

      await createImage.save({ session });
      return respond(c, "Image created successfully", false, 201, {
        _id: createImage._id,
      });
    });
  })

  .put("update_images", zValidator("json", updateImagesSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { name, description, isActive } = requestData;
      const { imageId } = requestData;

      const updatedImage = await Image.findByIdAndUpdate(
        imageId,
        {
          ...requestData,
        },
        { new: true, session },
      );

      if (!updatedImage) {
        return respond(c, "Image not found", true, 404, {});
      }

      return respond(c, "Image updated successfully", false, 200, {
        _id: updatedImage._id,
      });
    });
  })

  .get("fetch_images", async (c) => {
    const categoryBuckets = await CategoryBucket.find().lean();

    if (!categoryBuckets || categoryBuckets.length === 0) {
      return respond(c, "No categories found", true, 404);
    }

    const response = await Promise.all(
      categoryBuckets.map(async (category) => {
        const images = await Image.find({
          categoryBucketId: category._id,
        }).lean();
        return {
          categoryName: category.name,
          images: images.map((image) => ({
            name: image.name,
            imageUrl: image.imageUrl,
          })),
        };
      }),
    );

    return respond(
      c,
      "Categories and images fetched successfully",
      false,
      200,
      response,
    );
  });

export default imageBucketRouter;
