import mongoose from "mongoose";
import { videos } from "../models/video.model.js";
import { subscription } from "../models/Subscription.models.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";

const getChannelStats = asynchandling(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const stats = await videos.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.User?._id),
      },
    },
    {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "totalSubscriber",
      },
    },
    {
      $addFields: {
        totalSubscriber: {
          $size: "$totalSubscriber",
        },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $size: "$like",
        },
        totalViwes: {
          $sum: "$views",
        },
        $totalVideo: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        owner: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "User Data for stats is successfully fetched")
    );
});

const getChannelVideos = asynchandling(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const {id}=req.params;
  const AllVideos = await videos.find({
    owner: new mongoose.Types.ObjectId(id),
  });
  if (!AllVideos) {
    throw new ApiError(404, "No Video found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, AllVideos, "ALL Video Fetched"));
});

export { getChannelStats, getChannelVideos };
