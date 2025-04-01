import { Hono } from "hono";
import categoryBucketRouter from "./category";
import imageBucketRouter from "./images";

const bucketRouter = new Hono()
  .route("/category", categoryBucketRouter)
  .route("/images", imageBucketRouter);

export default bucketRouter;
