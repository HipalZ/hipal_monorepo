const express = require("express");

const { minioClient } = require("../minio-init");

const router = express.Router();

router.patch("/v1/storage", (req, res) => {
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
  updateStorageRouter: router,
};
