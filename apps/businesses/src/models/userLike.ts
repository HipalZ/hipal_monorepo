import mongoose from "mongoose" 


interface UserLikeAttrs {
  businessId:string;
  likes: string[];
 
};

interface UserLikeModel extends mongoose.Model<UserLikeDoc> {
  build(attrs: UserLikeAttrs): UserLikeDoc;
};

interface UserLikeDoc extends mongoose.Document {
    businessId: string;
    likes: string[];
  
};

const userLikeSchema = new mongoose.Schema({
    businessId: {
    type: String,
   
  },
  likes:[String]
   
  
  
});

userLikeSchema.statics.build = (attrs: UserLikeAttrs) => {
  return new UserLikes(attrs);
};

const UserLikes = mongoose.model<UserLikeDoc, UserLikeModel, {}>('Userlike', userLikeSchema);

export { UserLikes };
