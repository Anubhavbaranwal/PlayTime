import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
import { video } from "../models/video.model.js";

const uploadVideo = asynchandling(async (res, req) => {
  const {title,description} = req.body;
});

export { uploadVideo };
