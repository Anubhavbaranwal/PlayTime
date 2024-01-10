import mongoose from "mongoose";
import {  videos } from "../models/video.model.js";
import { subscription } from "../models/Subscription.models.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";

const getChannelStats = asynchandling(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
   
});

const getChannelVideos = asynchandling(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const AllVideos = await videos.find({
    owner: req.User?._id,
  });
  if (!AllVideos) {
    throw new ApiError(404, "No Video found");
  }
  return res.status(200).json(new ApiResponse(200,AllVideos,"ALL Video Fetched"))
});

export { getChannelStats, getChannelVideos };
