import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { createPost, updatePost, deletePost, getAllPosts, getPostById, togglePublishStatus, getUserPosts } from "../controllers/post.controllers.js";
const router = Router();

router.use(verifyUser);

// routes
router.route("/create").post(upload.single("image"), createPost);

router.route("/:postId")
.patch(updatePost)
.delete(deletePost);

router.route("/user/:userId").get(getUserPosts);
router.route("/").get(getAllPosts);
router.route("/:postId").get(getPostById);
router.route("/:postId/publish").patch(togglePublishStatus);

export default router
