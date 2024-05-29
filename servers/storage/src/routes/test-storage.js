const express = require("express");

const { minioClient } = require("../minio-init");

const router = express.Router();

router.get("/v1/storage/test", (req, res) => {
  minioClient.listBuckets((error, buckets) => {
    if (error) {
      console.log(error);
    } else {
      console.log(buckets);
      res.send(buckets);
    }
  });
});

module.exports = {
  testStorageRouter: router,
};
