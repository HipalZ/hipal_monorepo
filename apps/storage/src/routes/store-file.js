const express = require("express");
const fileUpload = require("express-fileupload");

const { minioClient } = require("../minio-init");

const router = express.Router();
router.use(fileUpload());

router.post("/v1/storage", async (req, res) => {
  const { bucketName, fileName } = req.body;
  const { fileData } = req.files;

  const file = fileData;

  const fileBuffer = file.data;

  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName, "ap-south-1");
  }

  const metaData = {
    "Content-Type": file.mimetype,
  };

  const resp = await minioClient.putObject(
    bucketName,
    fileName,
    fileBuffer,
    metaData
  );

  const minioURL = await minioClient.presignedGetObject(
    bucketName,
    fileName,
    24 * 60 * 60
  );

  // extract path from URL
  const url = new URL(minioURL);

  const fileURL = `https://dev.storage.domain/minio${url.pathname}${url.search}`;

  res.status(201).send({
    fileURL,
    ...resp,
  });
});

module.exports = {
  uploadStorageRouter: router,
};
