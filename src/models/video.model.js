import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: Users,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    Views: {
      type: Number,
      default:0,
      required: true,
    },
    isPublished: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);
VideoSchema.plugin(mongooseAggregatePaginate);
export const videos = mongoose.model("Video", VideoSchema);
