import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
import { videos } from "../models/video.model.js";
import { comment } from "../models/comments.model.js";
import { tweet } from "../models/tweets.models.js";

const toggleVideoLike = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const video = await videos.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Wrong video Id");
  }
  const likeStatus = await Like.findOne({
    $and: [
      { likedBy: new mongoose.Types.ObjectId(req.User?._id) },
      { video: new mongoose.Types.ObjectId(videoId) },
    ],
  });
  if (!likeStatus) {
    const like = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: new mongoose.Types.ObjectId(req.User?._id),
    });
    if (!like) {
      throw new ApiError(400, "Something went wrong");
    }
  } else {
    const unlike = await Like.findByIdAndDelete(likeStatus._id);
  }
  return res.status(200).json(new ApiResponse(200, {}, "Like button toggled"));
});

const toggleCommentLike = asynchandling(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const comment = await comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Wrong comment Id");
  }
  const likeStatus = await Like.findOne({
    $and: [
      { likedBy: new mongoose.Types.ObjectId(req.User?._id) },
      { comment: new mongoose.Types.ObjectId(commentId) },
    ],
  });
  if (!likeStatus) {
    const like = await Like.create({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: new mongoose.Types.ObjectId(req.User?._id),
    });
    if (!like) {
      throw new ApiError(400, "Something went wrong");
    }
  } else {
    const unlike = await Like.findByIdAndDelete(likeStatus._id);
  }
  return res.status(200).json(new ApiResponse(200, {}, "Like button toggled"));
});

const toggleTweetLike = asynchandling(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const tweet = await tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Wrong video Id");
  }
  const likeStatus = await Like.findOne({
    $and: [
      { likedBy: new mongoose.Types.ObjectId(req.User?._id) },
      { tweet: new mongoose.Types.ObjectId(tweetId) },
    ],
  });
  if (!likeStatus) {
    const like = await Like.create({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: new mongoose.Types.ObjectId(req.User?._id),
    });
    if (!like) {
      throw new ApiError(400, "Something went wrong");
    }
  } else {
    const unlike = await Like.findByIdAndDelete(likeStatus._id);
  }
  return res.status(200).json(new ApiResponse(200, {}, "Like button toggled"));
});

const getLikedVideos = asynchandling(async (req, res) => {
  //TODO: get all liked videos
  const LikedVideos = await Like.aggregate([
    {
      $match: {
        $and: [
          { video: { $ne: null } },
          { likedBy: new mongoose.Types.ObjectId(req.User?._id) },
        ],
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: $owner,
      },
    },
    {
      $addFields: {
        video: "$video",
      },
    },
    {
      $project: {
        video: 1,
      },
    },
  ]);
  if (!LikedVideos || LikedVideos.length === 0) {
    throw new ApiError(404, "No Video Liked By User");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,LikedVideos,"All Likeed Videos Fetched"))
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
