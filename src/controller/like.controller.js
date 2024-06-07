import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiresponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "invalid video");
  }

  const extistingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (!extistingLike) {
    const newLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    await newLike.save();

    return res.status(200).json(new apiresponse(200, newLike, "like added"));
  } else {
    await Like.findOneAndDelete({ video: videoId, likedBy: userId });
    return res.status(200).json(new apiresponse(200, "like removed"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId) {
    throw new ApiError(400, "invalid comment");
  }

  const extistingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (!extistingLike) {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    await newLike.save();

    return res.status(200).json(new apiresponse(200, newLike, "like added"));
  } else {
    await Like.findOneAndDelete({ comment: commentId, likedBy: userId });
    return res.status(200).json(new apiresponse(200, "like removed"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!tweetId) {
    throw new ApiError(400, "invalid comment");
  }

  const extistingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (!extistingLike) {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    await newLike.save();

    return res.status(200).json(new apiresponse(200, newLike, "like added"));
  } else {
    await Like.findOneAndDelete({ tweet: tweetId, likedBy: userId });
    return res.status(200).json(new apiresponse(200, "like removed"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.aggregate([
    { $match: { likedBy: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    {
      $project: {
        _id: "$videoDetails._id",
        videofile: "$videoDetails.videofile",
        thumbnail: "$videoDetails.thumbnail",
        title: "$videoDetails.title",
        description: "$videoDetails.description",
        time: "$videoDetails.time",
        view: "$videoDetails.view",
        isPublished: "$videoDetails.isPublished",
        owner: "$videoDetails.owner",
        createdAt: "$videoDetails.createdAt",
        updatedAt: "$videoDetails.updatedAt",
      },
    },
  ]);

  if (!likedVideos || likedVideos.length === 0) {
    throw new ApiError(500, "Failed to retrive the data");
  }

  return res
    .status(200)
    .json(new apiresponse(200, likedVideos, "all liked videos"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
