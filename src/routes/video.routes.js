import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middlewar.js";
import {
  deleteVideo,
  getAllvideo,
  getVideoById,
  publishVideo,
  updateVideo,
} from "../controller/video.controller.js";

const router = Router();

router.route("/upload-video").post(
  verifyjwt,
  upload.fields([
    {
      name: "videofile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/all-video").get(verifyjwt, getAllvideo);
router.route("/c/:videoId").get(getVideoById);
router.route("/c/:videoId").patch(verifyjwt,upload.single("videofile"),updateVideo);
router.route("/c/:id").post(verifyjwt,deleteVideo);

export default router;
