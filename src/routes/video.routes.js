import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { uploadVideo } from "../controllers/video.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/upload").post(
  VerifyJWT,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  uploadVideo
);

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export { router };
