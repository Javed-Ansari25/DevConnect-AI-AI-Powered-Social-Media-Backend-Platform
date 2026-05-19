import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { updateUserAvatar } from "../controllers/user.controllers.js";

const router = Router();

router.route("/upload").patch(
  verifyUser,
  upload.single("avatar"),
  updateUserAvatar
)

export default router;
