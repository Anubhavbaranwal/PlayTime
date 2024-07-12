import { asynchandling } from "../utils/asynchandling.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import {
  uploadFileCloudnary,
  deleteFilefromcloudinary,
} from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userid) => {
  try {
    const User = await user.findById(userid);
    const accesstoken = User.generateAccessToken();
    const refreshtoken = User.generateRefreshToken();
    User.refreshtoken = refreshtoken;
    await User.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong in Generating Access/Refresh Token"
    );
  }
};

const registerUser = asynchandling(async (req, res) => {
  //get user details from frontend
  //Validation-not empty
  //check if user already exists:username,email
  //check for images ,check for avatar
  //uploadd them to cloudinary,avatar
  //remove pasword and refresh token field from response
  //check for user creation
  // return res

  // step-get user details from frontend
  const { email, username, fullname, password } = req.body;

  //Step -2
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Each field is required");
  }

  //Step-3
  const existeduser = await user.findOne({
    $or: [{ username }, { email }],
  });

  if (existeduser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const avatarLocalpath = req.files?.avatar[0].path;
  console.log(req.files?.avatar[0].path, "abce");
  // const coverIMageLocalpath = req.files?.coverImage[0]?.path;

  let coverIMageLocalpath;
  let coverImage;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverIMageLocalpath = req.files.coverImage[0].path;
    coverImage = await uploadFileCloudnary(coverIMageLocalpath);
  }

  if (!avatarLocalpath) {
    console.log(avatarLocalpath, "abc");
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadFileCloudnary(avatarLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file upload failed");
  }

  const users = await user.create({
    username: username.toLowerCase(),
    avatar: avatar.url,
    fullname,
    email,
    coverImage: coverImage?.url || "",
    password,
  });

  const createdUser = await user
    .findById(users._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

//Login Control
const LoginUser = asynchandling(async (req, res) => {
  // req.body->data
  // username or email
  //find user
  // password check
  //access token and refresh token generate
  // send it to cookie

  const { email, username, password } = req.body;
  console.log(req);
  console.log(email, "   ", username);
  if (!email && !username) {
    throw new ApiError(400, "Username or email is required");
  }

  const users = await user.findOne({
    $or: [{ username }, { email }],
  });

  if (!users) {
    throw new ApiError(404, "User Not found");
  }
  const isuservalid = await users.isPasswordCorrect(password);

  if (!isuservalid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { accesstoken, refreshtoken } = await generateAccessandRefreshToken(
    users._id
  );

  const loggedinUser = await user
    .findById(users._id)
    .select("-password -refreshtoken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accesstoken,
          refreshtoken,
        },
        "User Logged In Successfully"
      )
    );
});

//Logout Control
const LogOut = asynchandling(async (req, res) => {
  await user.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "LoggedOut SuccessFully"));
});

const RefessAccessToken = asynchandling(async (req, res) => {
  const incomingToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "UnAuthorize Access");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const users = await user.findById(decodedToken?._id);

    if (!users) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== users?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshToken(users._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changePassword = asynchandling(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const User = await user.findById(req.User?._id);
  const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password");
  }

  User.password = newPassword;
  await User.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const currentUser = asynchandling(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, res.User, "Current User Fetched SuccessFully"));
});

///when updating file make another controller as it is advised in production level; code
const updateUserDetails = asynchandling(async (req, res) => {
  const { fullname, email } = req.body;

  if (!(fullname || email)) {
    throw new ApiError(400, "All Fields Are Required");
  }

  const User = user
    .findById(
      req.User?._id,
      {
        $set: {
          fullname,
          email,
        },
      },
      { new: true }
    )
    .select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, User, "Account Details Updated SuccessFully"));
});

const updateUserAvatar = asynchandling(async (req, res) => {
  const avatar = req.file?.path;

  if (!avatar) {
    throw new ApiError(400, "Please Add Avatar Link you want to keep");
  }

  const avatarlink = await uploadFileCloudnary(avatar);

  if (!avatarlink.url) {
    throw new ApiError(400, "Something went wrong on uploading file");
  }

  const prevLink = (await user.findById(req.User?._id))?.avatar ?? null;

  const User = await user
    .findByIdAndUpdate(
      req.User?._id,
      {
        $set: {
          avatar: avatarlink.url,
        },
      },
      {
        new: true,
      }
    )
    .select("-password");

  if (req.User && prevLink) {
    await deleteFilefromcloudinary(prevLink);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, User, "Avatar updated successfully"));
});
const updateUsercoverImage = asynchandling(async (req, res) => {
  const coverImage = req.file?.path;

  if (!coverImage) {
    throw new ApiError(400, "Please Add CoverImage Link you want to keep");
  }
  const prevLink = (await user.findById(req.User?._id))?.coverImage ?? null;

  const coverImagelink = await uploadFileCloudnary(coverImage);

  if (!coverImagelink.url) {
    throw new ApiError(400, "Something went wrong on uploading file");
  }

  const User = await user
    .findByIdAndUpdate(
      req.User?._id,
      {
        $set: {
          coverImage: coverImagelink.url,
        },
      },
      {
        new: true,
      }
    )
    .select("-password");

  if (prevLink) {
    await deleteFilefromcloudinary(prevLink);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, User, "cover Image updated successfully"));
});

const getChannelandSubscriber = asynchandling(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const channel = await user.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        email: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        channelSubscribedToCount: 1,
        subscriberCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel doesnot Exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "channel list generated successfully"));
});

const getWatchHistory = asynchandling(async (req, res) => {
  const User = await user.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.User?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);
  console.log(User);
  return res
    .status(200)
    .json(new ApiResponse(200, User, "Watch History is Fetched Successfully"));
});
const userbyid = asynchandling(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "User Id is required");
  }

  const User = await user.findById(id).select("-password -refreshtoken");

  if (!User) {
    throw new ApiError(404, "User Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, User, "User Fetched Successfully"));
});

export {
  registerUser,
  LoginUser,
  LogOut,
  RefessAccessToken,
  changePassword,
  currentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUsercoverImage,
  getChannelandSubscriber,
  getWatchHistory,
  userbyid,
};
