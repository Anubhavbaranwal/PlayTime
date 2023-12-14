import { asynchandling } from "../utils/asynchandling.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";

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
  console.log(email);

  //Step -2
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Each field is required");
  }

  //Step-3
  const existeduser = user.findOne({
    $or: [{ username }, { email }],
  });

  if (existeduser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalpath = req.files?.avatar[0].path;
  const coverIMageLocalpath = req.files?.coverImage[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uplloadOnCloudinary(avatarLocalpath);
  const coverImage = await uplloadOnCloudinary(coverIMageLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const users = await user.create({
    username: username.toLoercase(),
    avatar: avatar.url,
    fullname,
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

export default registerUser;
