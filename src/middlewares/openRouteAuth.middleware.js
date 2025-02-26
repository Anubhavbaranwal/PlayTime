import { user } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asynchandling } from "../utils/asynchandling.js";

const checkUser = asynchandling(async (req, _, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (accessToken) {
      const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );

      if (!decodedToken) next();

      const users = await user.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!users) next();

      req.User = users;
    }

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { checkUser };