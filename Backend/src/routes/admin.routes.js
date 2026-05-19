import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import { adminDeletePost, getAdminDashboard, getAllPostsForAdmin, getAllUsersForAdmin, toggleUserStatus } from "../controllers/admin.controllers.js";

const router = Router();
router.use(verifyUser, authorize("admin"));

// routes
router.route("/dashboard").get(getAdminDashboard);
router.route("/users").get(getAllUsersForAdmin);
router.route("/posts").get(getAllPostsForAdmin);
router.route("/posts/:postId").delete(adminDeletePost);
router.route("/users/:userId/status").patch(toggleUserStatus);

export default router
