import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/Subscription.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(VerifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/:channelId")
  .get(getUserChannelSubscribers)
  .patch(VerifyJWT,toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
