import { body } from "express-validator";

export const validateCustomer = [
  // businessId
  body("businessId")
    // valid mongoId
    .isMongoId()
    .withMessage("business Id must be valid")
    .bail(),
  // name
  body("name")
    // No Empty Names
    .notEmpty()
    .withMessage("customer name must not be empty")
    .bail()
    // No special characters
    .isAlphanumeric("en-IN", {
      ignore: `'"- &!`,
    })
    .withMessage("customer name must not contain special characters")
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage("customer name must be between 2 and 160 characters in length")
    .bail(),
  // visibility
  body("phone")
    // Required
    .notEmpty()
    .withMessage("phone is required")
    .bail()
    // boolean
    .isMobilePhone("en-IN")
    .withMessage("phone must be a valid phone number")
    .bail(),
];
