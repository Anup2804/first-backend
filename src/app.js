import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(
  // This is to give the access to everyone of database or to specific server.
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);


// This below  4 line ?? this all are middleware
app.use(express.json({ limit: "1mb" })),
  app.use(express.urlencoded({ extended: true, limit: "1mb" })),
  app.use(express.static("public")),
  app.use(cookieParser());
  app.use((err, req, res, next) => {
    let statusCode = 500;
  
    // Map specific error codes to HTTP status codes
    if (err.code === 'ENOENT') {
      statusCode = 404; // Not Found
    } else if (err.code === 'EACCES') {
      statusCode = 403; // Forbidden
    } else if (err.code === 'EPERM') {
      statusCode = 403; // Forbidden
    } else if (typeof err.code === 'number' && err.code >= 100 && err.code < 600) {
      statusCode = err.code; // Ensure err.code is a valid HTTP status code
    }
  
    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  });
  

// routes import

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import commentRouter from './routes/comment.routes.js'

// routes declartion

app.use("/api/v1/user", userRouter);

app.use('/api/v1/user/video',videoRouter)

app.use('/api/v1/user/comment',commentRouter)

export { app };

