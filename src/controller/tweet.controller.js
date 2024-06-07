import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiresponse } from "../utils/apiResponse.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(401, "content is required.");
  }

  const newTweet = await Tweet.create({
    content: content,
    owner: req.user?._id,
  });
  await newTweet.save();

  if (!newTweet) {
    throw new ApiError(500, "tweet not saved");
  }

  return res.status(200).json(new apiresponse(200, newTweet, "tweet saved"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "invalid user");
  }

  const userdetail = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerdetails",
      },
    },
    { $unwind: "$ownerdetails" },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerdetails.username",
          avatar: "$ownerdetails.avatar",
        },
      },
    },
  ]);

  if (!userdetail || userdetail.length === 0) {
    throw new ApiError(500, "data not found.");
  }

  return res
    .status(200)
    .json(new apiresponse(200, userdetail, "user details fetched"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content cannot be empty");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  tweet.content = content;
  await tweet.save();

  const updatedTweet = await Tweet.aggregate([
    { $match: { _id: tweet._id } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    { $unwind: "$ownerDetails" },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiresponse(200, updatedTweet[0], "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  if (!userId) {
    throw new ApiError(401, "invalid user");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(400, "tweet does not exist");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "unauthorized user");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res.status(200).json(new apiresponse(200, "tweet deleted."));
});

export { createTweet, getUserTweet, updateTweet, deleteTweet };
