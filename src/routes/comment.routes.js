import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/Comment.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openRouteAuth.middleware.js";

const router = Router();

// router.use(VerifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(checkUser,getVideoComments).post(VerifyJWT,addComment);
router.route("/:commentId").delete(VerifyJWT,deleteComment).patch(VerifyJWT,updateComment);

export default router;
