import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import helmet from "helmet";

const app = express();
app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())
app.use(express.static("public"))

// import route
import authRoute from "./routes/auth.routes.js"

// route declaration
app.use("/api/v1/auth", authRoute);


// Global Error Handler 
app.use((err, req, res, next) => {
  const statuscode = err.statuscode || 500;

  return res.status(statuscode).json({
    success: false,
    statuscode,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  })
})

export default app
