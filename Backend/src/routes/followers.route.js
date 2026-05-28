import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";

import { followUser, unfollowUser, getFollowers, getFollowing } from "../controllers/followers.controllers.js";

const router = Router();
router.use(verifyUser);

// Routes
router.route("/follow/:userId").post(followUser)
router.route("/unfollow/:userId").post(unfollowUser)
router.route("/:userId").get(getFollowers)
router.route("/following/:userId").get(getFollowing)

export default router;
