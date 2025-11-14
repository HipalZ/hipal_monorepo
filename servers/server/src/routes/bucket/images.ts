import { CategoryBucket, Image } from "@hi/db-models";
import { imagesSchema, updateImagesSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { pushToken } from "../../services/token";
import { respond } from "../../utils/response";

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
          categoryId: category._id,
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
  })

  .get(
    "fetch_Bucket_images",
    zValidator("query", z.object({ categoryId: z.string() })),
    async (c) => {
      const { categoryId } = c.req.query();
      if (!categoryId) {
        return respond(c, "Category ID is required", true, 400);
      }

      const category = await CategoryBucket.findById(categoryId).lean();
      if (!category) {
        return respond(c, "Category not found", true, 404);
      }

      const images = await Image.find({
        categoryBucketId: category._id,
      }).lean();

      if (!images || images.length === 0) {
        return respond(c, "No images found for this category", true, 404);
      }

      const response = {
        categoryName: category.name,
        images: images.map((image) => ({
          name: image.name,
          imageUrl: image.imageUrl,
        })),
      };

      return respond(c, "Images fetched successfully", false, 200, response);
    },
  )

  .get(
    "fetch_bucket_by_business",
    zValidator("query", z.object({ businessId: z.string() })),
    async (c) => {
      const { businessId } = c.req.query();
      if (!businessId) {
        return respond(c, "Business ID is required", true, 400);
      }
      const categoryBuckets = await CategoryBucket.find({
        businessId,
      }).lean();

      pushToken(c);

      if (!categoryBuckets || categoryBuckets.length === 0) {
        return respond(
          c,
          "No categories found for this business",
          true,
          404,
          [],
        );
      }

      const response = await Promise.all(
        categoryBuckets.map(async (category) => {
          const images = await Image.find({
            categoryBucketId: category._id,
          }).lean();
          return {
            categoryName: category.name,
            categoryId: category._id,
            images: images.map((image) => ({
              _id: image._id,
              name: image.name,
              imageUrl: image.imageUrl,
            })),
          };
        }),
      );

      return respond(
        c,
        "Categories fetched successfully",
        false,
        200,
        response,
      );
    },
  )

  .delete("delete_images", async (c) => {
    const { imageIds } = await c.req.json();

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return respond(c, "Image IDs are required", true, 400);
    }

    const deletedImages = await Image.deleteMany({ _id: { $in: imageIds } });

    if (deletedImages.deletedCount === 0) {
      return respond(c, "No images found to delete", true, 404);
    }

    return respond(
      c,
      `${deletedImages.deletedCount} images deleted successfully`,
      false,
      200,
    );
  });

export default imageBucketRouter;
