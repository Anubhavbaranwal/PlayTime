import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";
import {
  deleteFilefromcloudinary,
  uploadFileCloudnary,
} from "../utils/Cloudinary.js";
import { videos } from "../models/video.model.js";
import { user } from "../models/user.model.js";
const getAllVideos = asynchandling(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const aggregationPipeline = [
    {
      $match: {
        isPublished: true,
        ...(query ? { $text: { $search: query } } : {}), // Avoids error when query is empty
        ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {}), 
      },
    },
    ...(query
      ? [
          {
            $addFields: { st: { $meta: "textScore" } },
          },
        ]
      : []),
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: { path: "$owner", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        Views: 1,
        createdAt: 1,
        updatedAt: 1,
        duration: 1,
        owner: { username: 1, fullname: 1, avatar: 1 },
        ...(query ? { st: 1 } : {}),
      },
    },
    {
      $sort: query ? { st: -1, views: -1 } : { views: -1 }, 
    },
  ];

  const video = await videos.aggregatePaginate(videos.aggregate(aggregationPipeline), {
    page,
    limit,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong while getting all videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Get all videos successfully"));
});

const uploadVideo = asynchandling(async (req, res) => {

  const { title, description } = req.body;

  if (!(title || description)) {
    throw new ApiError(400, "title and description is required");
  }
  console.log(req.files);
  const vidoepath = req.files?.videoFile[0].path;

  if (!vidoepath) {
    throw new ApiError(400, "Video is required");
  }

  const thumbnailpath = req.files?.thumbnail?.[0].path;

  if (!thumbnailpath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const videoupload = await uploadFileCloudnary(vidoepath);
  const thumbnailupload = await uploadFileCloudnary(thumbnailpath);

  if (!(videoupload || thumbnailupload)) {
    throw new ApiError(400, "Something went wrong while uploading Video");
  }

  const video = await videos.create({
    title,
    description,
    videoFile: videoupload?.url,
    thumbnail: thumbnailupload?.url,
    isPublished: true,
    views: 0,
    duration: videoupload?.duration,
    owner: req.User?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded Successfully"));
});
const getVideoById = asynchandling(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await videos.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
        pipeline: [
          {
            $match: {
              liked: true,
            },
          },
          {
            $group: {
              _id: "$liked",
              likeOwners: { $push: "$likedBy" },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "dislikes",
        pipeline: [
          {
            $match: {
              liked: false,
            },
          },
          {
            $group: {
              _id: "$liked",
              dislikeOwners: { $push: "$likedBy" },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likes: {
          $cond: {
            if: {
              $gt: [{ $size: "$likes" }, 0],
            },
            then: { $first: "$likes.likeOwners" },
            else: [],
          },
        },
        dislikes: {
          $cond: {
            if: {
              $gt: [{ $size: "$dislikes" }, 0],
            },
            then: { $first: "$dislikes.dislikeOwners" },
            else: [],
          },
        },
      },
    },
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
              fullName: 1,
              avatar: 1,
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
        videoFile: 1,
        title: 1,
        description: 1,
        duration: 1,
        thumbnail: 1,
        Views: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
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

  if (!video.length > 0) throw new ApiError(400, "No video found");

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video sent successfully"));
});
const updateVideo = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  const thumbnail = req.files?.path;
  if (thumbnail) {
    const thumbnail = await uploadFileCloudnary(thumbnail);
  }

  if (!(title || description || thumbnail)) {
    throw new ApiError(400, "Please Provide the data to update ");
  }

  const prevLink = await videos.findById(videoId)?.thumbnail;
  const updateObject = {};
  if (title) updateObject.title = title;
  if (description) updateObject.description = description;
  if (thumbnail) {
    updateObject.thumbnail = thumbnail;
    await deleteFilefromcloudinary(prevLink);
  }

  const updatedVideo = await videos.findByIdAndUpdate(videoId, updateObject, {
    new: true,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});
const deleteVideo = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  const thumbLink = await videos.findById(videoId)?.thumbnail;
  const video = await videos.findById(videoId)?.videoFile;

  const deletedVideo = await videos.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(400, "video deletion failed");
  }
  const deleteVideodata = await deleteFilefromcloudinary(video);
  const deletethumnaildata = await deleteFilefromcloudinary(thumbLink);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted Successfully"));
});

const togglePublishStatus = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  const publish = await videos.findById(videoId);
  if (!publish) {
    throw new ApiError(200, "Something Went Wrong Please Try Again");
  }
  const publishValue = await videos.findById(videoId);
  console.log(publishValue.isPublished);
  const value = publishValue.isPublished;

  const isPublish = await videos.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !value,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, isPublish, "Publish Status Changed Successfully")
    );
});

const updateView = asynchandling(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "videoId required");

  const video = await videos.findById(videoId);
  if (!video) throw new ApiError(400, "Video not found");

  video.Views += 1;
  const updatedVideo = await video.save();
  if (!updatedVideo) throw new ApiError(400, "Error occurred on updating view");

  let watchHistory;
  if (req.User) {
    watchHistory = await user.findByIdAndUpdate(
      req.User?._id,
      {
        $push: {
          watchHistory: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        new: true,
      }
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSuccess: true, views: updatedVideo.Views, watchHistory },
        "Video views updated successfully"
      )
    );
});
export {
  getAllVideos,
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  updateView
};
