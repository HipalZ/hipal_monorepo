import { body } from 'express-validator';
import {
  BestTimeToConsume,
  PortionBestSuited,
  BestWeather,
  BestOccasion,
  FoodTexture,
  DishPrepTime,
  LevelOfSpice,
} from '@hipal/common';

export const validateExistingDish = [
  // businessId
  body('businessId')
    .optional()
    // valid mongoId
    .isMongoId()
    .withMessage('business Id must be valid')
    .bail()
  ,
  // kitchenId
  body('kitchenId')
    .optional()
    // valid mongoId
    .isMongoId()
    .withMessage('kitchen Id must be valid')
    .bail()
  ,
  // name
  body('name')
    .optional()
    // No Empty Names
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
  // price
  body('price')
    .optional()
    // valid price
    .isFloat({
      min: 1,
      max: 50000
    })
    .withMessage('Price must be valid')
    .bail()
  ,
  // tax
  body('tax')
    .optional({checkFalsy: true})
    // valid price
    .isFloat({
      min: 1,
      max: 50000
    })
    .withMessage('Tax must be valid')
    .bail()
  ,
  // discount
  body('discount')
    .optional({checkFalsy: true})
    // valid price
    .isFloat({
      min: 1,
      max: 50000
    })
    .withMessage('discount must be valid')
    .bail()
  ,
  // avgTime
  body('avgTime')
    .optional({checkFalsy: true})
    // valid time
    .isFloat({
      min: 1,
      max: 50000
    })
    .withMessage('avgTime must be valid')
    .bail()
  ,
  // dishType
  body('dishType')
    .optional()
    // valid time
    .notEmpty()
    .withMessage('dishType must not be empty')
    .bail()
  ,
  // categories
  body('categories.*.id')
    // valid id
    .isMongoId()
    .withMessage('Category Id must be valid')
    .bail()
  ,
  body('categories.*.name')
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
  // portions
  body('portions.*.name')
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('portion name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('portion name must be between 2 and 160 characters in length')
    .bail()
  ,
  body('portions.*.price')
    // valid price
    .isFloat({
      min: 1,
      max: 50000,
    })
    .withMessage('portion price must be valid')
    .bail()
  ,
  body('portions.*.discount')
    .optional({ checkFalsy: true })
    // valid discount
    .isFloat({
      min: 1,
      max: 50000,
    })
    .withMessage('discount price must be valid')
    .bail()
  ,
  body('visibility')
    .optional()
    // valid boolean
    .isBoolean()
    .withMessage('visibility must be boolean')
    .bail()
  ,
  body('portions.*.default')
    .optional({ checkFalsy: true })
    // valid boolean
    .isBoolean()
    .withMessage('portion default must be boolean')
    .bail()
  ,
  // extras
  body('extras.*.name')
    .optional({checkFalsy: true})
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('extra name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('extra name must be between 2 and 160 characters in length')
    .bail()
  ,
  body('extras.*.numOptions')
    .optional({checkFalsy: true})
    // valid number
    .isFloat()
    .withMessage('extras num options must be a number')
    .bail()
  ,
  body('extras.*.numSelections')
    .optional({checkFalsy: true})
    // valid number
    .isFloat()
    .withMessage('extras num selections must be a number')
    .bail()
  ,
  body('extras.*.compulsory')
    .optional({checkFalsy: true})
    // valid number
    .isFloat()
    .withMessage('extras compulsory must be a number')
    .bail()
  ,
  body('extras.*.items.*.name')
    .optional({checkFalsy: true})
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('extra item name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('extra item name must be between 2 and 160 characters in length')
    .bail()
  ,
  body('extras.*.items.*.price')
    .optional({checkFalsy: true})
    // valid number
    .isFloat()
    .withMessage('extras item price must be a number')
    .bail()
  ,
  // filters
  body('filters.dishes.*.id')
    .optional({checkFalsy: true})
    // valid IDs
    .isMongoId()
    .withMessage('Filter dishes must have a valid id')
    .bail()
  ,
  body('filters.dishes.*.name')
    .optional({checkFalsy: true})
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('filter dish name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('filter dish name must be between 2 and 160 characters in length')
    .bail()
  ,
  body('filters.timeToConsume')
    .optional({checkFalsy: true})
    // valid value
    .isIn(Object.values(BestTimeToConsume))
    .withMessage('Filter time to consume must have a valid value')
    .bail()
  ,
  body('filters.portionBestSuited')
    .optional({checkFalsy: true})
    // valid value
    .isIn(Object.values(PortionBestSuited))
    .withMessage('Filter portions must have a valid value')
    .bail()
  ,
  body('filters.bestWeather')
    .optional({checkFalsy: true})
    // valid value
    .isIn(Object.values(BestWeather))
    .withMessage('Filter weather must have a valid value')
    .bail()
  ,
  body('filters.levelOfSpice')
    .optional({checkFalsy: true})
    // valid value
    .isIn(Object.values(LevelOfSpice))
    .withMessage('Filter level of spice must have a valid value')
    .bail()
  ,
  body('filters.bestOccasion')
    .optional({checkFalsy: true})
    // valid value
    .isIn(Object.values(BestOccasion))
    .withMessage('Filter best occasion must have a valid value')
    .bail()
  ,
  body('filters.texture')
    .optional({checkFalsy: true})
    // valid value
    .isIn(Object.values(FoodTexture))
    .withMessage('Filter texture must have a valid value')
    .bail()
  ,
  body('filters.time')
    .optional({checkFalsy: true})
    // valid value
    .isIn(Object.values(DishPrepTime))
    .withMessage('Filter time must have a valid value')
    .bail()
  ,
  // images
  body('images.*')
    // Required
    .notEmpty()
    .withMessage('images is required')
    .bail()
    // URL
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('images URL is not valid or blacklisted')
    .bail()
  ,
  // description
  body('description')
    .optional({checkFalsy: true})
    // Required
    .notEmpty()
    .withMessage('Description is required')
    .bail()
    // Character limit
    .isLength({
      min: 5,
      max: 2000,
    })
    .withMessage('Description must be between 5 and 2000 characters in length')
    .bail()
  ,
  // tags
  body('tags.*')
    .optional()
    // Required
    .notEmpty()
    .withMessage('Tag cannot be empty')
    .bail()
    // Character limit
    .isLength({
      min: 3,
      max: 50,
    })
    .withMessage('Tag must be between 3 and 50 characters in length')
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
];
