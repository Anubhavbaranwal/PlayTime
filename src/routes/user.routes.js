import { Router } from "express";
import {
  registerUser,
  LoginUser,
  LogOut,
  RefessAccessToken,
  getChannelandSubscriber,
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

export default router;
