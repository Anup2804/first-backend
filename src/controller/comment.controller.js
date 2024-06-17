import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiresponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // yet to complete.
});

const addComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { videoId } = req.params;

  if (!comment || !videoId) {
    throw new ApiError(401, "video or comment not found.");
  }

  const owner = await User.findById(req.user?._id);

  if (!owner) {
    throw new ApiError(500, "user not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, "video not found of deleted");
  }

  const newComment = await Comment.create({
    comment,
    video: video._id,
    owner: owner._id,
  });

  const commentResult = await Comment.aggregate([
    {
      $match: {
        _id: newComment._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $project:{
        _id:1,
        video:1,
        comment:1,  
        owner:{
          username:'$ownerDetails.username',
          avatar:'$ownerDetails.avatar'
        },
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  if(!commentResult || commentResult.length === 0){
    throw new ApiError(500, 'Failed to retrieve the added comment');
  }

  res.status(200).json(new apiresponse(200,commentResult[0], "comment done"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    throw new ApiError(402, "no comment found");
  }

  const existingComment = await Comment.findById(id);

  if (!existingComment) {
    throw new ApiError(401, "invalid comment id");
  }

  if (existingComment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(300, "unauthorized user");
  }

  existingComment.comment = comment;
  const updateComment = await existingComment.save();

  res.status(200).json(new apiresponse(200, updateComment, "comment updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const findComment = await Comment.findById(id);

  if (!findComment) {
    throw new ApiError(401, "invaild comment id");
  }

  if (findComment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(500, "invalid user");
  }

  await Comment.findByIdAndDelete(id);

  res.status(200).json(new apiresponse(200, "comment deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
