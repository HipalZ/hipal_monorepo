import { body } from 'express-validator';
import { BusinessType } from '@hipal/common';

export const validateBusiness = [
  // businessName
  body('businessName')
    // No Empty Names
    .notEmpty()
    .withMessage('business name must not be empty')
    .bail()
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!`
    })
    .withMessage('business name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('business name must be between 2 and 160 characters in length')
    .bail()
  ,
  // registeredName
  body('registeredName')
    // No Empty Names
    .notEmpty()
    .withMessage('Registered name must not be empty')
    .bail()
    // No special characters
    .isAlphanumeric('en-IN', {
      ignore: `'"- &!,.!?\\/@$`
    })
    .withMessage('Registered name must not contain special characters')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 160,
    })
    .withMessage('Registered name must be between 2 and 160 characters in length')
    .bail()
  ,
  // businessType
  body('businessType')
    // No Empty Type
    .notEmpty()
    .withMessage('Business Type must not be empty')
    .bail()
    // No invalid values
    .isIn(Object.values(BusinessType))
    .withMessage('Business Type is not valid')
    .bail()
  ,
  // gstRegistered
  body('gstRegistered')
    // Required
    .notEmpty()
    .withMessage('GST Registration status required')
    .bail()
    // boolean
    .isBoolean()
    .withMessage('GST Registration status must be a boolean')
    .bail()
  ,
  // multipleOutlets
  body('multipleOutlets')
    // Required
    .notEmpty()
    .withMessage('Multiple outlets status required')
    .bail()
    // boolean
    .isBoolean()
    .withMessage('Multiple outlets status must be a boolean')
    .bail()
  ,
  // customLink
  body('customLink')
    // Required
    .notEmpty()
    .withMessage('customLink is required')
    .bail()
    // Character limit
    .isLength({
      min: 2,
      max: 50,
    })
    .withMessage('business name must be between 2 and 50 characters in length')
    .bail()
  ,
  // logo
  body('logo')
    // Required
    .notEmpty()
    .withMessage('logo is required')
    .bail()
    // URL
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('Logo URL is not valid or blacklisted')
    .bail()
  ,
  // address
  body('address')
    // Required
    .notEmpty()
    .withMessage('Address is required')
    .bail()
    // Character limit
    .isLength({
      min: 50,
      max: 2000,
    })
    .withMessage('Address must be between 50 and 2000 characters in length')
    .bail()
  ,
  // staff
  // body('staff')
  //   // Required
  //   .isArray({
  //     min: 1
  //   })
  //   .withMessage('Staff Ids are required')
  //   .bail(),
  // body('staff.*')
  //   // valid mongo IDs
  //   .isMongoId()
  //   .withMessage('Staff Ids must be valid')
  //   .bail()
  // ,
];
