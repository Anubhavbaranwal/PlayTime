import mongoose, { isValidObjectId } from "mongoose";
import {  playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";

const createPlaylist = asynchandling(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!(name || description)) {
    throw new ApiError(400, "Please fill the required Field");
  }
  const playlistCreate = new playlist.create({
    name,
    description,
    owner: new mongoose.Types.ObjectId(req.User?._id),
  });

  if (!playlistCreate) {
    throw new ApiError(400, "Something went wrong while creating playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistCreate, "playlist created successfully")
    );
});

const getUserPlaylists = asynchandling(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const allPlaylist = await playlist.findById(userId);
  if (!allPlaylist) {
    throw new ApiError(400, "no Playlist Exists ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allPlaylist, "Playlist fetched Successfully"));
});

const getPlaylistById = asynchandling(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "please provide correect playlist Id");
  }
  const getPlaylist = await playlist.findById(playlistId);
  if (!getPlaylist) {
    throw new ApiError(400, "No Playlist exists");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, getPlaylist, "Playlist found Successfully"));
});

const addVideoToPlaylist = asynchandling(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId || videoId)) {
    throw new ApiError(400, "PlaylistId and videoId both required");
  }
  const addVideo = await playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  );
  if (!addVideo) {
    throw new ApiError(400, "Something Went Wrong");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        addVideo,
        "video added to the playlist ,Successfully"
      )
    );
});

const removeVideoFromPlaylist = asynchandling(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!(playlistId || videoId)) {
    throw new ApiError(400, "Please the required field");
  }
  const playlistdata = await playlist.findById(playlistId);
  const videodata = await playlist.findById(videoId);
  if (!(playlistdata || videodata)) {
    throw new ApiError(400, "Please provide correct ID");
  }
  const remove_video = await playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: videoId,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        remove_video,
        "Video Removed from Playlist Successfully"
      )
    );
});

const deletePlaylist = asynchandling(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "playlistId is required");
  }
  const deletelist = await playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletelist, "Playlist deleted Successfully"));
});

const updatePlaylist = asynchandling(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!(name || description)) {
    throw new ApiError(400, "each field required");
  }
  const findPlaylist = await playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "can't found any playlist with such id");
  }
  const updatePlaylistdata = await playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylistdata, "Playlist Updated Successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
