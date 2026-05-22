import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";

import { followUser, unfollowUser, getFollowers, getFollowing } from "../controllers/followers.controllers.js";

const router = Router();
router.use(verifyUser);

// Routes
router.route("/follow/:userId").post(followUser)
router.route("/unfollow/:userId").post(unfollowUser)
router.route("/followers").get(getFollowers)
router.route("/following").get(getFollowing)

export default router;