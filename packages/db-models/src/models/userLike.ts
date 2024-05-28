import mongoose, { Model } from "mongoose"
import { UserLike } from "../validators"

const userLikeSchema = new mongoose.Schema<UserLike>({
  businessId: {
    type: String,

  },
  likes: [String]
}, {
  timestamps: true
});

const UserLikes: Model<UserLike> = mongoose.model<UserLike>('Userlike', userLikeSchema);

export { UserLikes };
