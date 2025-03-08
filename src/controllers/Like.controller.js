import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";;
import { videos } from "../models/video.model.js";
import {  comment } from "../models/comments.model.js";
import { tweet } from "../models/tweets.models.js";
import { asynchandling } from "../utils/asynchandling.js";

const getLikedVideos = asynchandling(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        video: { $ne: null },
        likedBy: new mongoose.Types.ObjectId(req.User?._id),
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
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $match: {
        "video.isPublished": true,
      },
    },
    {
      $group: {
        _id: "likedBy",
        videos: { $push: "$video" },
      },
    },
  ]);

  const videos = likedVideos[0]?.videos || [];

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos sent successfully"));
});

const toggleLike = asynchandling(async (req, res) => {
  const { toggleLike, commentId, videoId, tweetId } = req.query;

  let reqLike;

  if (
    !isValidObjectId(commentId) &&
    !isValidObjectId(tweetId) &&
    !isValidObjectId(videoId)
  )
    throw new ApiError(400, "Invalid id");

  if (toggleLike === "true") reqLike = true;
  else if (toggleLike === "false") reqLike = false;
  else throw new ApiError(400, "Invalid query string!!!");

  let userLike;
  console.log(commentId, videoId, tweetId, req.user?._id,req.User?._id);
  if (commentId) {
    const comments = await comment.findById(commentId);
    if (!comments) throw new ApiError(400, "No comment found");

    userLike = await Like.find({
      comment: commentId,
      likedBy: req.User?._id,
    });
  } else if (videoId) {
    const video = await videos.findById(videoId);
    if (!video) throw new ApiError(400, "No video found");

    userLike = await Like.find({
      video: videoId,
      likedBy: req.User?._id,
    });
  } else if (tweetId) {
    const tweets = await tweet.findById(tweetId);
    if (!tweets) throw new ApiError(400, "No tweet found");

    userLike = await Like.find({
      tweet: tweetId,
      likedBy: req.User?._id,
    });
  }

  let isLiked = false;
  let isDisLiked = false;

  if (userLike?.length > 0) {
    // entry is present so toggle status
    if (userLike[0].liked) {
      // like is present
      if (reqLike) {
        // toggle like so delete like
        await Like.findByIdAndDelete(userLike[0]._id);
        isLiked = false;
        isDisLiked = false;
      } else {
        // toggle dis-like so make it dislike
        userLike[0].liked = false;
        let res = await userLike[0].save();
        if (!res) throw new ApiError(500, "error while updating like");
        isLiked = false;
        isDisLiked = true;
      }
    } else {
      // dis-like is present
      if (reqLike) {
        // toggle like so make it like
        userLike[0].liked = true;
        let res = await userLike[0].save();
        if (!res) throw new ApiError(500, "error while updating like");
        isLiked = true;
        isDisLiked = false;
      } else {
        // toggle dis-like so delete dis-like
        await Like.findByIdAndDelete(userLike[0]._id);
        isLiked = false;
        isDisLiked = false;
      }
    }
  } else {
    // entry is not present so create new
    let like;
    if (commentId) {
      like = await Like.create({
        comment: commentId,
        likedBy: req.User?._id,
        liked: reqLike,
      });
    } else if (videoId) {
      like = await Like.create({
        video: videoId,
        likedBy: req.User?._id,
        liked: reqLike,
      });
    } else if (tweetId) {
      like = await Like.create({
        tweet: tweetId,
        likedBy: req.User?._id,
        liked: reqLike,
      });
    }
    if (!like) throw new ApiError(500, "error while toggling like");
    isLiked = reqLike;
    isDisLiked = !reqLike;
  }

  let totalDisLikes, totalLikes;

  if (commentId) {
    totalLikes = await Like.find({ comment: commentId, liked: true });
    totalDisLikes = await Like.find({ comment: commentId, liked: false });
  } else if (videoId) {
    totalLikes = await Like.find({ video: videoId, liked: true });
    totalDisLikes = await Like.find({ video: videoId, liked: false });
  } else if (tweetId) {
    totalLikes = await Like.find({ tweet: tweetId, liked: true });
    totalDisLikes = await Like.find({ tweet: tweetId, liked: false });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked,
        totalLikes: totalLikes.length,
        isDisLiked,
        totalDisLikes: totalDisLikes.length,
      },
      "Like toggled successfully"
    )
  );
});


const toggleVideoLike = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  const { toggleLike } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  const video = await videos.findById(videoId);
  if (!video) throw new ApiError(400, "video not found");

  let isLiked = await Like.find({ video: videoId, likedBy: req.user?._id });

  if (isLiked && isLiked.length > 0) {
    const like = await Like.findByIdAndDelete(isLiked[0]._id);
    isLiked = false;
  } else {
    const like = await Like.create({ video: videoId, likedBy: req.user?._id });
    if (!like) throw new ApiError(500, "error while toggling like");
    isLiked = true;
  }

  let totalLikes = await Like.find({ video: videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked, totalLikes: totalLikes.length },
        "like toggled successfully"
      )
    );
});

const toggleCommentLike = asynchandling(async (req, res) => {
  const { commentId } = req.params;
  const { toggleLike } = req.query;

  let reqLike;

  if (!isValidObjectId(commentId)) throw new ApiError(400, "invalid commentId");
  if (toggleLike === "true") reqLike = true;
  else if (toggleLike === "false") reqLike = false;
  else throw new ApiError(400, "Invalid query string!!!");

  const comment = await comment.findById(commentId);
  if (!comment) throw new ApiError(400, "no comment found");

  let userLike = await Like.find({
    comment: commentId,
    likedBy: req.user?._id,
  });

  let isLiked = false;
  let isDisLiked = false;

  if (userLike?.length > 0) {
    // entry is present so toggle status
    if (userLike[0].liked) {
      // like is present
      if (reqLike) {
        // toggle like so delete like
        await Like.findByIdAndDelete(userLike[0]._id);
        isLiked = false;
        isDisLiked = false;
      } else {
        // toggle dis-like so make it dislike
        userLike[0].liked = false;
        let res = await userLike[0].save();
        if (!res) throw new ApiError(500, "error while updating like");
        isLiked = false;
        isDisLiked = true;
      }
    } else {
      // dis-like is present
      if (reqLike) {
        // toggle like so make it like
        userLike[0].liked = true;
        let res = await userLike[0].save();
        if (!res) throw new ApiError(500, "error while updating like");
        isLiked = true;
        isDisLiked = false;
      } else {
        // toggle dis-like so delete dis-like
        await Like.findByIdAndDelete(userLike[0]._id);
        isLiked = false;
        isDisLiked = false;
      }
    }
  } else {
    // entry is not present so create new
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
      liked: reqLike,
    });
    if (!like) throw new ApiError(500, "error while toggling like");
    isLiked = reqLike;
    isDisLiked = !reqLike;
  }

  let totalLikes = await Like.find({ comment: commentId, liked: true });
  let totalDisLikes = await Like.find({ comment: commentId, liked: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked,
        totalLikes: totalLikes.length,
        isDisLiked,
        totalDisLikes: totalDisLikes.length,
      },
      "Comment like toggled successfully"
    )
  );
});

const toggleTweetLike = asynchandling(async (req, res) => {
  const { tweetId } = req.params;
  const { toggleLike } = req.query;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweetId");
  const tweet = await tweet.findById(tweetId);
  if (!tweet) throw new ApiError(400, "no tweet found");

  let isLiked = await Like.find({ tweet: tweetId, likedBy: req.user?._id });

  if (isLiked?.length > 0) {
    await Like.findByIdAndDelete(isLiked[0]._id);
    isLiked = false;
  } else {
    const like = await Like.create({ tweet: tweetId, likedBy: req.user?._id });
    if (!like) throw new ApiError(500, "error while toggling like");
    isLiked = true;
  }

  let totalLikes = await Like.find({ tweet: tweetId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked, totalLikes: totalLikes.length },
        "Tweet like toggled successfully"
      )
    );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  toggleLike,
};