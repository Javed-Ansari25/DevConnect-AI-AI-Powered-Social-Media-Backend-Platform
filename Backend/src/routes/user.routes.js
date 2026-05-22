import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { addAvatar, addCoverImage, addBio, updateProfile, getProfile, deleteProfile, changePassword } 
from "../controllers/user.controllers.js";

const router = Router();
router.use(verifyUser);

// Routes
router.route("/get/profile").get(getProfile)

router.route("/add/avatar").patch(
  upload.single("avatar"),
  addAvatar
)

router.route("/add/coverImage").patch(
  upload.single("coverImage"),
  addCoverImage
)

router.route("/add/bio").patch(addBio)

router.route("/update/profile").patch(
  updateProfile
)

router.route("/delete/profile").delete(deleteProfile)

router.route("/change/password").patch(changePassword)

export default router;
