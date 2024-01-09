import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asyncHandler.js";

const getVideoComments = asynchandling(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await video.find(videoId);
  if (!video) {
    throw new ApiError(201, " Video Not Found");
  }

  const comments = await Comment.find({ videoId })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new Apiresponse(201, comments, "omments fetched Successfully"));
});

const addComment = asynchandling(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(411, "VideoId is Not Valid");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Please provide the comment");
  }

  const commentdone = new Comment.create({
    user: req.User._id,
    video: videoId,
    content,
  });

  return req
    .status(200)
    .json(new Apiresponse(200, commentdone, "comment done successfully"));
});

const updateComment = asynchandling(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asynchandling(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
