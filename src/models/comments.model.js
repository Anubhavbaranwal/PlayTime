import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
});

export const comment=mongoose.model("comment",commentSchema);