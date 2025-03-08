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
  userbyid,
  getUserChannelProfile,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openRouteAuth.middleware.js";


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
router.route("/logout").post( LogOut);
router.route("/refresh-token").post(RefessAccessToken);
router.route("/change-password").patch(VerifyJWT, changePassword);
router.route("/current-user").get(VerifyJWT, currentUser);

router.route("/update-profile").patch(VerifyJWT, updateUserDetails);
router.route("/c/:username").get(checkUser,getUserChannelProfile);
router
  .route("/avatar")
  .patch(VerifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/coverImage")
  .patch(VerifyJWT, upload.single("coverImage"), updateUsercoverImage);
router.route("/getchannel/:username").post(VerifyJWT, getChannelandSubscriber);
router.route("/history").get(VerifyJWT, getWatchHistory);
router.route("/:id").get(userbyid);

export default router;
