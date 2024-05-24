import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  // This is to give the access to everyone of database or to specific server.
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// This below  4 line ??
app.use(express.json({ limit: "16kb" })),
  app.use(express.urlencoded({ extended: true, limit: "16kb" })),
  app.use(express.static("public")),
  app.use(cookieParser());

// routes import

import userRouter from "./routes/user.routes.js";

// routes declartion

app.use("/api/v1/user", userRouter);

export { app };
