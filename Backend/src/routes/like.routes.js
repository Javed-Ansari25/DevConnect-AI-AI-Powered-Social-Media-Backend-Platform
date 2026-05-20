import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";

import { toggleLike } from "../controllers/like.controllers.js";

const router = Router();
router.use(verifyUser);

// Routes
router.route("/:postId").post(toggleLike)

export default router;
