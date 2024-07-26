import mongoose, { isValidObjectId } from "mongoose";
import { user } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
import { tweet } from "../models/tweets.models.js";

const createTweet = asynchandling(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  console.log(req.User);
  if (!content) {
    throw new ApiError(400, "Please Provide the username and content both");
  }

  const tweets = await tweet.create({
    owner: req.User?._id,
    content,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweet created Successfully"));
});

const getUserTweets = asynchandling(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(404, "user not found");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(500, `bad format of User id `);
  }
  const userdata = await user.findById(userId);

  if (!userdata) {
    throw new ApiError(404, "user data not found");
  }

  const tweets = await tweet.find({
    owner: userdata?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "ALL tweets Fetched Successfully"));
});

const updateTweet = asynchandling(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;
  if (!content) {
    throw new ApiError(404, " Please give Input ");
  }
  if (!tweetId) {
    throw new ApiError(404, `Tweet Not Found With the following ${tweetId} `);
  }
  const updatedtweet = await tweet.findByIdAndUpdate(tweetId, {
    $set: {
      content,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedtweet, "tweet Updated Successfully"));
});

const deleteTweet = asynchandling(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "TweetId not Valid");
  }
  const deletedtweet = await tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedtweet, "Tweet Deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
