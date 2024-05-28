import mongoose from "mongoose";


interface UrlAttrs {
  longUrl: string;
  shortUrl: string;
  urlCode: string;
 
};

//longUrl: longUrl, shortUrl: `http://localhost:3000/${id.toLowerCase()}`, urlCode: id 

interface UrlModel extends mongoose.Model<UrlDoc> {
  build(attrs: UrlAttrs): UrlDoc;
};

interface UrlDoc extends mongoose.Document {
    longUrl: string;
    shortUrl: string;
    urlCode: string;
};


const urlSchema = new mongoose.Schema({
    longUrl: {
    type: String,
  },
  shortUrl: {
    type: String,
 
  },
  urlCode: {
    type: String,
  },
 
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
});

urlSchema.statics.build = (attrs: UrlAttrs) => {
  return new UrlModel(attrs);
};

const UrlModel = mongoose.model<UrlDoc, UrlModel, {}>('UrlModel', urlSchema);

export { UrlModel };
