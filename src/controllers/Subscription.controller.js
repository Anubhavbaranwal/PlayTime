import mongoose, { isValidObjectId } from "mongoose";
import { user } from "../models/user.model.js";
import { subscription } from "../models/Subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";

const toggleSubscription = asynchandling(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "channel Id is not valid");
  }
  const subscriberId = req.User._id;
  const subscribed = await subscription.findOne({
    $and: [
      { subscriber: new mongoose.Types.ObjectId(subscriberId) },
      { channel: new mongoose.Types.ObjectId(channelId) },
    ],
  });
  let tooglefunc;
  if (!subscribed) {
    tooglefunc = await subscription.create({
      subscriber: new mongoose.Types.ObjectId(subscriberId),
      channel: new mongoose.Types.ObjectId(channelId),
    });
    if (!tooglefunc) {
      throw new ApiError(401, "Please try again something went wrong");
    }
  } else {
    tooglefunc = await subscription.findByIdAndDelete(subscribed._id);
  }
  return res
    .status(200)
    .json(new Apiresponse(200, tooglefunc, "subcription function executed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynchandling(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }

  const subscriber = await subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        avatar: 1,
      },

      // $lookup:{
      //   from:"users",
      //   localField:"channel",
      //   foreignField:"_id",
      //   as:"subscribers"
      // }
    },
  ]);

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        subscriber,
        "List of subscriber is fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynchandling(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "no subscriber exists with such id");
  }
  const subscribedTo = await subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        avatar: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, subscribedTo, "List of Subscribed channel"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
