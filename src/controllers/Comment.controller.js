import mongoose,{isValidObjectId} from "mongoose";
import { comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
import { videos } from "../models/video.model.js";

// const getVideoComments = asynchandling(async (req, res) => {
//   //TODO: get all comments for a video
//   const { videoId } = req.params;
//   const { page = 1, limit = 10 } = req.query;

//   if (!videoId) {
//     throw new ApiError(400, "Video id is required");
//   }
  
//   const video = await videos.findById(videoId);
//   if (!video) {
//     throw new ApiError(201, " Video Not Found");
//   }
  
//   const comments = await comment
//     .find({ videoId })
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .sort({ createdAt: -1 });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, comments, "omments fetched Successfully"));
// });
const getVideoComments = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoId");
  }

  const options = {
    page,
    limit,
  };

  const video = await videos.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const allComments = await comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
        pipeline: [
          {
            $match: {
              liked: true,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "dislikes",
        pipeline: [
          {
            $match: {
              liked: false,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        disLikesCount: { $size: "$dislikes" },
        isLiked: {
          $cond: {
            if: { $in: [req.User?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
        isDisLiked: {
          $cond: {
            if: { $in: [req.User?._id, "$dislikes.likedBy"] },
            then: true,
            else: false,
          },
        },
        isLikedByVideoOwner: {
          $cond: {
            if: { $in: [video.owner, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        content: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
        isOwner: {
          $cond: {
            if: { $eq: [req.User?._id, "$owner._id"] },
            then: true,
            else: false,
          },
        },
        likesCount: 1,
        disLikesCount: 1,
        isLiked: 1,
        isDisLiked: 1,
        isLikedByVideoOwner: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, allComments, "All comments sent successfully"));
});

const addComment = asynchandling(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(411, "VideoId is Not Valid");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Please provide the comment");
  }

  const commentdone = await comment.create({
    user: req.User._id,
    video: videoId,
    content,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, commentdone, "comment done successfully"));
});

const updateComment = asynchandling(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "commentID not Valid");
  }
  const { newComment } = req.body;
  if (!newComment) {
    throw new ApiError(406, "new Comment content is missing");
  }

  const update = await comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newComment,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(204)
    .json(new ApiResponse(204, update, "Comment Updated Successfully"));
});

const deleteComment = asynchandling(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Please provide the comment id ");
  }

  const deletecomm = await comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletecomm, "comment Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
