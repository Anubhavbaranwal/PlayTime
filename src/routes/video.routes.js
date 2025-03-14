import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import {
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos,
  updateView,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { checkUser } from "../middlewares/openRouteAuth.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllVideos)
  .post(
    VerifyJWT,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "videoFile", maxCount: 1 },
    ]),
    uploadVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
router.route("/view/:videoId").patch(checkUser,updateView);


export default router;
