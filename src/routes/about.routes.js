import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openRouteAuth.middleware.js";
import {
  getAboutChannel,
  addChannelDescription,
  addLink,
  removeLink,
  updateLink,
} from "../controllers/About.controller.js";

const router = Router();
router.route("/:userId").get(getAboutChannel);
router.route("/description").patch(VerifyJWT, addChannelDescription);
router.route("/link/add").post(VerifyJWT, addLink);

router.route("/link/:linkId").patch(VerifyJWT, updateLink);
router.route("/link/:linkId").delete(VerifyJWT, removeLink);

export default router;