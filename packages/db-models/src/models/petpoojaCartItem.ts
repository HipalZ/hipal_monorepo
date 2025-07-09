import mongoose from "mongoose";

const petPoojaCartItemSchema = new mongoose.Schema(
  {
    petpoojaCart: {
      type: Object,
    },
    tableName: {
      type: String,
      required: false,
    },

    cartItems: {
      type: [Object],
      required: false,
    },
    businessId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PetpoojaCartItem = mongoose.model(
  "petpoojacartitem",
  petPoojaCartItemSchema,
);

export { PetpoojaCartItem };
