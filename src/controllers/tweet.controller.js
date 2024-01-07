import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
import { tweet } from "../models/tweets.models.js";

const createTweet = asynchandling(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Please Provide the username and content both");
  }

  const tweet = new Tweet.create({
    owner: req.User?._id,
    content,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created Successfully"));
});

const getUserTweets = asynchandling(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(404, "user not found");
  }

  const tweets =
    await Tweet.aggregate[
      ({
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "content",
          foreignField: "_id",
          as: "alltweets",
        },
      })
    ];
  return res.status(200).json(200, tweets, "ALL tweets Fetched Successfully");
});

const updateTweet = asynchandling(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asynchandling(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
