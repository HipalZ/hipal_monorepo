const express = require("express");
const {
  NotFoundError,
  requireAuth,
  validateRequest,
} = require("@hipal/common");

const { minioClient } = require("../minio-init");

const router = express.Router();

router.get(
  "/v1/storage",
  // requireAuth,
  async (req, res) => {
    const { bucketName, fileName } = req.query;
    try {
      const metaData = await minioClient.statObject(bucketName, fileName);
    } catch (e) {
      throw new NotFoundError();
    }

    const minioURL = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      24 * 60 * 60
    );

    // extract path from URL
    const url = new URL(minioURL);

    const fileURL = `https://storage.hipal.life/minio${url.pathname}${url.search}`;

    res.status(200).send({
      fileURL,
    });
  }
);

router.get("/v1/storage/listofBuckets", async (req, res) => {
  try {
    const buckets = await minioClient.listBuckets();

    if (!buckets || !buckets.length) {
      return res.send([]);
    }

    const allData = [];

    let processedBuckets = 0;

    buckets.forEach((bucket) => {
      const bucketData = {
        bucketName: bucket.name,
        objects: [],
      };

      const stream = minioClient.listObjects(bucket.name, "", true);

      stream.on("data", (obj) => {
        bucketData.objects.push(obj);
      });

      stream.on("end", () => {
        processedBuckets++;
        allData.push(bucketData);

        if (processedBuckets === buckets.length) {
          return res.send(allData);
        }
      });

      stream.on("error", (err) => {
        console.log(`Error listing objects for bucket ${bucket.name}:`, err);

        processedBuckets++;
        allData.push(bucketData);

        if (processedBuckets === buckets.length) {
          return res.send(allData);
        }
      });
    });
  } catch (err) {
    console.log("Error listing buckets:", err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = {
  getStorageRouter: router,
};
