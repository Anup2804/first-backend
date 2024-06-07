import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controller/like.controller.js";

const router = Router();

router.route("/video/:videoId").post(verifyjwt, toggleVideoLike);

router.route("/comment/:commentId").post(verifyjwt, toggleCommentLike);

router.route("/tweet/:tweetId").post(verifyjwt, toggleTweetLike);

router.route("/getAllLikedVideos").get(verifyjwt, getLikedVideos);

export default router;
