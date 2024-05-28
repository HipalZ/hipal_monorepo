import { body } from 'express-validator';
import { CategoryHierarchy } from '@hipal/common';

export const validateCategory = [
  // businessId
  body('businessId')
    // valid mongoId
    .isMongoId()
    .withMessage('business Id must be valid')
    .bail()
  ,
  // name
  body('name')
    // No Empty Names
    .notEmpty()
    .withMessage('category name must not be empty')
    .bail()
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('category name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('category name must be between 2 and 160 characters in length')
    .bail()
  ,
  // visibility
  body('visibility')
    // Required
    .notEmpty()
    .withMessage('Visibility is required')
    .bail()
    // boolean
    .isBoolean()
    .withMessage('Visibility must be a boolean')
    .bail()
  ,
  // timerOn
  body('timerOn')
    // Required
    .notEmpty()
    .withMessage('timerOn is required')
    .bail()
    // boolean
    .isBoolean()
    .withMessage('timerOn must be a boolean')
    .bail()
  ,
  // timerStart
  body('timerStart')
    // Required
    .if(body('timerOn').custom((value) => !!value))
    .notEmpty()
    .withMessage('timerStart is required when timerOn')
    .bail()
  ,
  // timerEnd
  body('timerEnd')
    // Required
    .if(body('timerOn').custom((value) => !!value))
    .notEmpty()
    .withMessage('timerEnd is required when timerOn')
    .bail()
  ,
  // availableDays
  body('availableDays.*')
    .optional()
    // valid values
    .isFloat({
      min: 0,
      max: 6,
    })
    .withMessage('available days must be integers')
    .bail()
  ,
  // hierarchy
  body('hierarchy')
    // No Empty Type
    .notEmpty()
    .withMessage('Hierarchy must not be empty')
    .bail()
    // No invalid values
    .isIn(Object.values(CategoryHierarchy))
    .withMessage('Hierarchy is not valid')
    .bail()
  ,
  // parentCategory
  body('parentCategory')
    .if(body('hierarchy').custom((value) => value === CategoryHierarchy.CHILD))
    // No Empty Names
    .notEmpty()
    .withMessage('parentCategory must not be empty')
    .bail()
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('parentCategory must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('parentCategory must be between 2 and 160 characters in length')
    .bail()
  ,
  // coverImage
  body('coverImage')
    .optional({checkFalsy: true})
    // Required
    .notEmpty()
    .withMessage('coverImage is required')
    .bail()
    // URL
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('coverImage URL is not valid or blacklisted')
    .bail()
  ,
  // links
  body('links.*')
    .optional()
    // URL
    .isURL()
    .withMessage('links URL is not valid')
    .bail()
  ,
  // dishes
  body('dishes.*.id')
    // URL
    .isMongoId()
    .withMessage('Dish Id is not valid')
    .bail()
  ,
  body('dishes.*.name')
    // No empty name
    .notEmpty()
    .withMessage('dish name must not be empty')
    .bail()
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('dish name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('dish name must be between 2 and 160 characters in length')
    .bail()
  ,
];
