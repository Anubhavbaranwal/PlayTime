import mongoose from "mongoose";
import { Video, videos } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";

const getChannelStats = asynchandling(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

});

const getChannelVideos = asynchandling(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const AllVideos=await videos.find({
    
  })
});

export { getChannelStats, getChannelVideos };
