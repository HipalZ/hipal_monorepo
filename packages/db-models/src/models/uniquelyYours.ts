import mongoose, { type Model } from 'mongoose';
import type { UniquelyYoursType } from '../validators';
const { Schema } = mongoose;
const ObjectIdSchema = Schema.Types.ObjectId;

const uniquelyYoursSchema = new Schema<UniquelyYoursType>({
  name: { type: String, required: true },
  businessId: { type: ObjectIdSchema, required: true, ref: 'Business' },
  dishId: { type: ObjectIdSchema, required: true, ref: 'Dish' },
  dishType: { type: String, required: true },
  images: { type: [String], required: true },
  isDeleted: { type: Boolean, default: false },
});

const UniquelyYours: Model<UniquelyYoursType> = mongoose.model<UniquelyYoursType>('uniquely', uniquelyYoursSchema);

export { UniquelyYours };
