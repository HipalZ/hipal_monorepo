import { body } from 'express-validator';

export const validateSettings = [
  // businessId
  body('businessId')
    // valid mongoId
    .isMongoId()
    .withMessage('business Id must be valid')
    .bail()
  ,
  // themes
  // primaryColor
  body('themes.primaryColor')
    .optional({ checkFalsy: true })
    // valid color
    .isHexColor()
    .withMessage('primary color must be hex color')
    .bail()
  ,
  // secondaryColor
  body('themes.secondaryColor')
    .optional({ checkFalsy: true })
    // valid color
    .isHexColor()
    .withMessage('primary color must be hex color')
    .bail()
  ,
  // accentColor
  body('themes.accentColor')
    .optional({ checkFalsy: true })
    // valid color
    .isHexColor()
    .withMessage('accent color must be hex color')
    .bail()
  ,
  // fontFamily
  body('themes.fontFamily')
    .optional({ checkFalsy: true })
    // valid font
    .notEmpty()
    .withMessage('font family must be valid')
    .bail()
  ,
  // fontURL
  body('themes.fontURL')
    .optional({ checkFalsy: true })
    // valid url
    .isURL()
    .withMessage('font URL must be valid')
    .bail()
  ,
  // buttonStyle
  body('themes.buttonStyle')
    .optional({ checkFalsy: true })
    // valid font
    .notEmpty()
    .withMessage('buttonStyle must be valid')
    .bail()
  ,
  // miniBanner
  body('themes.miniBanner')
    .optional({ checkFalsy: true })
    // valid url
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('miniBanner must be valid')
    .bail()
  ,
  // specialBanner
  body('themes.specialBanner')
    .optional({ checkFalsy: true })
    // valid url
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('specialBanner must be valid')
    .bail()
  ,
  // endBanner
  body('themes.endBanner')
    .optional({ checkFalsy: true })
    // valid url
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('endBanner must be valid')
    .bail()
  ,
  // instagramLink
  body('themes.instagramLink')
    .optional({ checkFalsy: true })
    // valid url
    .isURL()
    .withMessage('instagramLink must be valid')
    .bail()
  ,
  // facebookLink
  body('themes.facebookLink')
    .optional({ checkFalsy: true })
    // valid url
    .isURL()
    .withMessage('facebookLink must be valid')
    .bail()
  ,
  // youtubeLink
  body('themes.youtubeLink')
    .optional({ checkFalsy: true })
    // valid url
    .isURL()
    .withMessage('youtubeLink must be valid')
    .bail()
  ,
  // linkedinLink
  body('themes.linkedinLink')
    .optional({ checkFalsy: true })
    // valid url
    .isURL()
    .withMessage('linkedinLink must be valid')
    .bail()
  ,
  // footerText
  body('themes.footerText')
    .optional({ checkFalsy: true })
    // valid url
    .notEmpty()
    .withMessage('footer Text must be valid')
    .bail()
  ,
  // explore
  // wallpaper
  body('explore.wallpaper')
    .optional({ checkFalsy: true })
    // valid url
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('wallpaper must be valid')
    .bail()
  ,
  // phone
  body('explore.phone')
    .optional({ checkFalsy: true })
    // valid phone
    .isMobilePhone('en-IN')
    .withMessage('phone number must be a valid Indian number')
    .bail()
  ,
  // countryCode
  body('explore.countryCode')
    .if(body('explore.phone').exists({ checkFalsy: true }))
    // valid country code
    .notEmpty()
    .withMessage('country code must be valid')
    .bail()
  ,
  // location
  body('explore.location')
    .optional({ checkFalsy: true })
    // valid url
    .isURL()
    .withMessage('location must be a valid URL')
    .bail()
  ,
  // openFrom
  body('explore.openFrom')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('open From must be a valid time')
    .bail()
  ,
  // openTill
  body('explore.openTill')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('open Till must be a valid time')
    .bail()
  ,
  // specialOffers
  // wallpaper
  body('explore.specialOffers.*.wallpaper')
    .optional({checkFalsy: true})
    // valid url
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('special offers wallpaper must be a valid URL')
    .bail()
  ,
  // offerName
  body('explore.specialOffers.*.offerName')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('offerName must be a valid')
    .bail()
  ,
  // redirectType
  body('explore.specialOffers.*.redirectType')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('redirectType must be valid')
    .bail()
  ,
  // redirectId
  body('explore.specialOffers.*.redirectId')
    .optional({checkFalsy: true})
    .isMongoId()
    .withMessage('redirectId must be valid')
    .bail()
  ,
  // redirectName
  body('explore.specialOffers.*.redirectName')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('redirectName must be valid')
    .bail()
  ,
  // popular
  body('explore.popular.*.name')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('popular dish name must be valid')
    .bail()
  ,
  body('explore.popular.*.id')
    .optional({checkFalsy: true})
    .isMongoId()
    .withMessage('popular dish id must be valid')
    .bail()
  ,
  // highlights
  body('explore.highlights.*.name')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('Highlights name must be valid')
    .bail()
  ,
  body('explore.highlights.*.stories.*')
    .optional({checkFalsy: true})
    .isURL({
      host_whitelist: [
        'storage.hipal.life',
        'hipal.life'
      ]
    })
    .withMessage('Story name must be a valid URL')
    .bail()
  ,
  // navigation
  // from
  body('navigation.from')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('Navigation from name must be valid')
    .bail()
  ,
  // to
  body('navigation.to')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('Navigation to name must be valid')
    .bail()
  ,
  // categoryCard
  body('navigation.categoryCard')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('Navigation categoryCard name must be valid')
    .bail()
  ,
  // dishCard
  body('navigation.dishCard')
    .optional({checkFalsy: true})
    .notEmpty()
    .withMessage('Navigation dishCard name must be valid')
    .bail()
  ,
  // categoryOrder
  body('categoryOrder.*')
    // valid mongoId
    .isMongoId()
    .withMessage('Category order must be valid')
    .bail()
  ,
];