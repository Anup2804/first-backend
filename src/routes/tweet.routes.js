import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controller/tweet.controller.js";


const router = Router();


router.route("/add-tweet").post(verifyjwt,createTweet)

router.route("/getUserTweet").get(verifyjwt,getUserTweet)

router.route("/update-tweet/:tweetId").patch(verifyjwt,updateTweet)

router.route("/delete-tweet/:tweetId").delete(verifyjwt,deleteTweet)



export default router