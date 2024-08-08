import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { NoteType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const noteSchema = new mongoose.Schema<NoteType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  userId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  noteUrl: {
    type: String,
    required: false,
  },
  noteTitle: {
    type: String,
    required: true,
  },
  noteDescription: {
    type: String,
    required: false,
  },
});

const Note: Model<NoteType> = mongoose.model<NoteType>("Note", noteSchema);

export { Note };
