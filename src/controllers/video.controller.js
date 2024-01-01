import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
// import { video } from "../models/video.model.js";
import { uploadFileCloudnary } from "../utils/Cloudinary.js";
import { videos } from "../models/video.model.js";

const uploadVideo = asynchandling(async (res, req) => {
  const { title, description } = req.body;

  if (!(title || description)) {
    throw new ApiError(400, "title and description is required");
  }

  const vidoepath = req.files?.video[0].path;

  if (!vidoepath) {
    throw new ApiError(400, "Video is required");
  }

  const thumbnailpath = req.files?.thumbnail[0].path;

  if (!thumbnailpath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const videoupload = await uploadFileCloudnary(vidoepath);
  const thumbnailupload = await uploadFileCloudnary(thumbnailpath);

  if (!(videoupload || thumbnailupload)) {
    throw new ApiError(400, "Something went wrong while uploading Video");
  }

  const video = await videos.create({
    title,
    description,
    videoFile: videoupload?.url,
    thumbnail: thumbnailupload?.url,
    isPublished: true,
    views,
    owner: req.User?._id,
  });
});

export { uploadVideo };
