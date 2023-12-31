import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
// import { video } from "../models/video.model.js";
import {
  deleteFilefromcloudinary,
  uploadFileCloudnary,
} from "../utils/Cloudinary.js";
import { videos } from "../models/video.model.js";
import mongoose from "mongoose";
const getAllVideos = asynchandling(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});
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
    duration: videoupload?.duration,
    owner: req.User?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded Successfully"));
});

const getVideoById = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const videoFile = await videos.findById(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, videoFile, "Video successfully found "));
});

const updateVideo = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  const thumbnail = req.files?.path;
  if (thumbnail) {
    const thumbnail = await uploadFileCloudnary(thumbnail);
  }

  if (!(title || description || thumbnail)) {
    throw new ApiError(400, "Please Provide the data to update ");
  }

  const prevLink = await videos.findById(videoId)?.thumbnail;
  const updateObject = {};
  if (title) updateObject.title = title;
  if (description) updateObject.description = description;
  if (thumbnail) {
    updateObject.thumbnail = thumbnail;
    await deleteFilefromcloudinary(prevLink);
  }

  const updatedVideo = await videos.findByIdAndUpdate(videoId, updateObject, {
    new: true,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});
const deleteVideo = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  const thumbLink = await videos.findById(videoId)?.thumbnail;
  const video = await videos.findById(videoId)?.videoFile;

  const deletedVideo = await videos.findByIdAndDelete(videoId);
  if (deletedVideo) {
    throw new ApiError(400, "Video Not Found");
  }
  const deleteVideodata = await deleteFilefromcloudinary(video);
  const deletethumnaildata = await deleteFilefromcloudinary(thumbLink);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted Successfully"));
});

const togglePublishStatus = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  const publish = await videos.findById(videoId)?.isPublished;
  if (!publish) {
    throw new ApiError(200, "Something Went Wrong Please Try Again");
  }
  const isPublish = await videos.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !publish,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, isPublish, "Publish Status Changed Successfully")
    );
});

export { uploadVideo, getVideoById };
