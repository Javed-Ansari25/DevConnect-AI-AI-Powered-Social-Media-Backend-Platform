import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import { register,verifyOTP, resendOTP, login, logout, getCurrentUser, refreshAccessToken} from "../controllers/auth.controllers.js";
const router = Router();

// routes
router.route("/register").post(register);
router.route("/verify/otp").post(verifyOTP);
router.route("/resend/otp").post(resendOTP);

router.route("/login").post(login);
router.route("/logout").post(verifyUser, logout);;
router.route("/currentUser").get(verifyUser, getCurrentUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router
