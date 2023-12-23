import { user } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asynchandling } from "../utils/asynchandling";

export const VerifyJWT = asynchandling(async (req, res, next) => {
  const token =
    req.cookie?.accesstoken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorize request");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  await user.findById(decodedToken._id).select("-password -refreshtoken")

  
});
