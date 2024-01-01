import { Router } from "express";
import {
  registerUser,
  LoginUser,
  LogOut,
  RefessAccessToken,
  getChannelandSubscriber,
  changePassword,
  currentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUsercoverImage,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(LoginUser);

//secured Routes
router.route("/logout").post(VerifyJWT, LogOut);
router.route("/refresh-token").post(RefessAccessToken);
router.route("/change-password").post(VerifyJWT, changePassword);
router.route("/current-user").get(VerifyJWT, currentUser);
router.route("/update-userdetail").patch(VerifyJWT, updateUserDetails);
router
  .route("/update-avatar")
  .patch(VerifyJWT, upload.single("/avatar"), updateUserAvatar);
router
  .route("/update-coverImage")
  .patch(VerifyJWT, upload.single("/coverimage"), updateUsercoverImage);
router.route("/getchannel/:username").post(VerifyJWT, getChannelandSubscriber);
router.route("/watchhistory").get(VerifyJWT,getWatchHistory)


export default router;
