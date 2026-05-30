import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";

import { chatWithAI, getChatHistory, clearChatHistory } from "../controllers/chat.controllers.js";

const router = Router();
router.use(verifyUser);

router.route("/").post(chatWithAI);
router.route("/history").get(getChatHistory);
router.route("/history").delete(clearChatHistory);

export default router;
