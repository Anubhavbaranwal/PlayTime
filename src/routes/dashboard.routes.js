import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/Dashboard.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(VerifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/video").get(getChannelVideos);

export default router;
