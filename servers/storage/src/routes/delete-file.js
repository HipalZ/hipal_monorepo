const express = require("express");
const { requireAuth, validateRequest } = require("@hipal/common");
const { body } = require("express-validator");

const { minioClient } = require("../minio-init");

const router = express.Router();

router.delete(
  "/v1/storage",
  requireAuth,
  [
    body("bucketName")
      .not()
      .isEmpty()
      .withMessage("Bucket name must be specified"),
    body("fileName").not().isEmpty().withMessage("File name must be  specified"),
  ],
  validateRequest,
  async (req, res) => {
    const { bucketName, fileName } = req.body;

    await minioClient.removeObject(bucketName, fileName);

    res.status(200).send({
      status: "success",
    });
  }
);

module.exports = {
  deleteStorageRouter: router,
};
