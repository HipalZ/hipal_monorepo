import mongoose, { type Model } from 'mongoose';
import { Alignment, type BannerType, BannerTypes, FontWeight, RedirectionType } from '../validators/banner';
const { Schema } = mongoose;

const bannerSchema = new Schema<BannerType>({
  businessId: { type: Schema.Types.ObjectId, required: true },
  bannerType: { type: String, enum: BannerTypes, required: false },
  bannerImage: { type: String, required: false },
  heading: { type: String, required: false },
  headingColor: { type: String, required: false },
  headingFontWeight: { type: String, enum: FontWeight, required: false },
  headingAlign: { type: String, enum: Alignment, required: false },
  paragraph: { type: String, required: false },
  paragraphColor: { type: String, required: false },
  paragraphFontWeight: { type: String, enum: FontWeight, required: false },
  paragraphAlign: { type: String, enum: Alignment, required: false },
  buttonName: { type: String, required: false },
  buttonColor: { type: String, required: false },
  callToAction: { type: String, required: false },
  backgroundColor: { type: String, required: false },
  redirectionId: { type: String, required: false },
  redirectionType: { type: String, enum: RedirectionType, required: false },
  redirectionName:{type:String, required:false},
  isDeleted: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
});

const Banner: Model<BannerType> = mongoose.model<BannerType>('Banner', bannerSchema);

export { Banner };
