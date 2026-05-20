import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { addAvatar, addCoverImage, addBio } from "../controllers/user.controllers.js";

const router = Router();
router.use(verifyUser);

router.route("/add/avatar").patch(
  upload.single("avatar"),
  addAvatar
)

router.route("/add/coverImage").patch(
  upload.single("coverImage"),
  addCoverImage
)

router.route("/add/bio").patch(addBio)

export default router;
