import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asyncHandler.js";

const healthcheck = asynchandling(async (_req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message

  return res
    .status(200)
    .json(new ApiResponse(200, "", "service is working fine."));
});

export { healthcheck };
