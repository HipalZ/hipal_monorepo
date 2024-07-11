import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
const themeSchema = new mongoose.Schema({
  businessId: {
    type: ObjectId,
    required: true,
    ref: 'Business',
    index: true,
  },
  theme: {
    type: {},
    required: false,
  },
});

const Theme = mongoose.model('theme', themeSchema);

export { Theme };
