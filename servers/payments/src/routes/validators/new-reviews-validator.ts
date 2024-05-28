import { body } from "express-validator";

export const validateReviews = [
  // businessId
  body("businessId")
    // valid mongoId
    .isMongoId()
    .withMessage("business Id must be valid")
    .bail(),
  // name
  body("reviewerName")
    // No Empty Names
    .notEmpty()
    .withMessage("reviewerName name must not be empty")
    .bail()
    // No special characters
    .isAlphanumeric("en-IN", {
      ignore: `'"- &!`,
    })
    .withMessage("reviewerName name must not contain special characters")
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage(
      "reviewerName name must be between 2 and 160 characters in length"
    )
    .bail(),
  // visibility
  body("reviewerPhone")
    // Required
    .notEmpty()
    .withMessage("phone is required")
    .bail()
    // boolean
    .isMobilePhone("en-IN")
    .withMessage("phone must be a valid phone number")
    .bail(),

  //description

  body("description")
    //optional
    .optional()
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage("description must be between 2 and 160 characters in length")
    .bail(),

  //reviewRating
  body("reviewRating")
    // Required
    .notEmpty()
    .withMessage("reviewRating is required")
    .bail()
    // boolean
    .isNumeric()
    .withMessage("reviewRating must be a number")
    .bail(),
];
