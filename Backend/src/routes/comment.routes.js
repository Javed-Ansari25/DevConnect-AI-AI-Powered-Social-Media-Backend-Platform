import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";

import {  createComment, deleteComment, getCommentsByPostId, updateComment } from "../controllers/comment.controllers.js";

const router = Router();
router.use(verifyUser);

// Routes
router.route("/:postId")
.post(createComment)

router.route("/:commentId")
.patch(updateComment)
.delete(deleteComment);

router.route("/post/:postId").get(getCommentsByPostId)

export default router;
