import mongoose, { isValidObjectId } from "mongoose";
import { user } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
import { tweet } from "../models/tweets.models.js";

const createTweet = asynchandling(async (req, res) => {
  //TODO: create tweet
  const { tweet:content } = req.body;

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
  const content = req.body.tweet;
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

const getallTweets = asynchandling(async (req, res) => {
  const allTweets = await tweet.aggregate([
    // sort by latest
    {
      $sort: {
        createdAt: -1,
      },
    },
    // fetch likes of tweet
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
        pipeline: [
          {
            $match: {
              liked: true,
            },
          },
          {
            $group: {
              _id: "liked",
              owners: { $push: "$likedBy" },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "dislikes",
        pipeline: [
          {
            $match: {
              liked: false,
            },
          },
          {
            $group: {
              _id: "liked",
              owners: { $push: "$likedBy" },
            },
          },
        ],
      },
    },
    // Reshape Likes and dislikes
    {
      $addFields: {
        likes: {
          $cond: {
            if: {
              $gt: [{ $size: "$likes" }, 0],
            },
            then: { $first: "$likes.owners" },
            else: [],
          },
        },
        dislikes: {
          $cond: {
            if: {
              $gt: [{ $size: "$dislikes" }, 0],
            },
            then: { $first: "$dislikes.owners" },
            else: [],
          },
        },
      },
    },
    // get owner details
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
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
        isOwner: {
          $cond: {
            if: { $eq: [req.User?._id, "$owner._id"] },
            then: true,
            else: false,
          },
        },
        totalLikes: {
          $size: "$likes",
        },
        totalDisLikes: {
          $size: "$dislikes",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.User?._id, "$likes"],
            },
            then: true,
            else: false,
          },
        },
        isDisLiked: {
          $cond: {
            if: {
              $in: [req.User?._id, "$dislikes"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200,allTweets,"All Tweets Fetched Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet,getallTweets };
