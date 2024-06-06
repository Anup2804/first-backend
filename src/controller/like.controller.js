import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiresponse } from "../utils/apiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {TweetId} = req.params
});

const getLikedVideos = asyncHandler(async (req, res) => {});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
