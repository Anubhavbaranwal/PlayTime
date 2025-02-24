import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getallTweets,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(VerifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet).get(getallTweets);

router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
