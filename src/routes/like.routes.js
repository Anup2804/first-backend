import { Router } from "express";
import { upload } from "../middleware/multer.middlewar.js";
import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();