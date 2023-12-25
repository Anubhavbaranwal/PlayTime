import { asynchandling } from "../utils/asynchandling.js";
import { ApiError } from "../utils/ApiError.js";
import { user} from "../models/user.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { uploadFileCloudnary } from "../utils/Cloudinary.js";
import  jwt  from "jsonwebtoken";

const generateAccessandRefreshToken = async (userid) => {
  try {
    const User =await user.findById(userid);
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
  console.log(req.body);
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

  console.log(req.files);

  const avatarLocalpath = req.files?.avatar[0].path;
  // const coverIMageLocalpath = req.files?.coverImage[0]?.path;

  let coverIMageLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverIMageLocalpath = req.files.coverImage[0].path;
  }

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadFileCloudnary(avatarLocalpath);
  const coverImage = await uploadFileCloudnary(coverIMageLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
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
    req.user._id,
    {
      $set: {
        refreshtoken: undefined,
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

const RefessAccessToken =asynchandling(async(req,res)=>{
  const incomingToken=req.cookie.refreshToken||req.body.refreshToken
   
  if(!incomingToken){
    throw new ApiError(401,"UnAuthorize Access");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
  )

  const users = await user.findById(decodedToken?._id)

  if (!users) {
      throw new ApiError(401, "Invalid refresh token")
  }

  if (incomingRefreshToken !== users?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
      
  }

  const options = {
      httpOnly: true,
      secure: true
  }

  const {accessToken, newRefreshToken} = await generateAccessandRefreshToken(users._id)

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", newRefreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {accessToken, refreshToken: newRefreshToken},
          "Access token refreshed"
      )
  )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

export { registerUser, LoginUser, LogOut ,RefessAccessToken };
