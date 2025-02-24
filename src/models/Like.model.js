import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "tweet",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    liked:{
      type: Boolean,
      default: true,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

export const Like = mongoose.model("Like", likeSchema);
