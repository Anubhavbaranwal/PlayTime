import { Router } from 'express';
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    toggleLike,
} from "../controllers/Like.controller.js"
import {VerifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(VerifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").patch(toggleLike);
router.route("/comment/:commentId").patch(toggleCommentLike);
router.route("/tweet/:tweetId").patch(toggleTweetLike);
router.route("/video/:videoId").patch(toggleVideoLike);
router.route("/videos").get(getLikedVideos);

export default router