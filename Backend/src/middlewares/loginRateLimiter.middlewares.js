import rateLimit, {ipKeyGenerator} from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req)}-${req.body.email}`;
  },
  message: {
    success: false,
    message: "Too many login attempts. Try again after 10 minutes"
  }
})

export default loginLimiter