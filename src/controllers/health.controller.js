import { ApiResponse } from "../utils/Apiresponse.js";
import { asynchandling } from "../utils/asynchandling.js";

const healthcheck = asynchandling(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "", "service is working fine."));
});

export { healthcheck };
