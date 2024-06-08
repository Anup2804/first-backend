import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiresponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, videoId } = req.body;
  const userId = req.user?._id;

  if (!name || !description) {
    throw new ApiError(400, "Name and description  are required");
  }

  let validVideoIds = [];
  if (videoId) {
    if (Array.isArray(videoId)) {
      validVideoIds = await Promise.all(
        videoId.map(async (id) => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, `Invalid video ID: ${id}`);
          }
          const video = await Video.findById(id);
          if (!video) {
            throw new ApiError(404, `Video not found: ${id}`);
          }
          return video._id;
        })
      );
    } else {
      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, `Invalid video ID: ${videoId}`);
      }
      const video = await Video.findById(videoId);
      if (!video) {
        throw new ApiError(404, `Video not found: ${videoId}`);
      }
      validVideoIds.push(video._id);
    }
  }
  console.log(validVideoIds);

  const playlist = new Playlist({
    name,
    description,
    owner: userId,
    videos: validVideoIds,
  });

  await playlist.save();

  const playlistDetails = await Playlist.aggregate([
    { $match: { _id: playlist._id } },
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
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
        },
        videos: {
          $map: {
            input: "$videos",
            as: "videoId",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$videoDetails",
                    as: "video",
                    cond: { $eq: ["$$video._id", "$$videoId"] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
  ]);

  return res
    .status(201)
    .json(
      new apiresponse(201, playlistDetails, "Playlist created successfully")
    );
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(402, "invalid user.");
  }

  //   const userPlaylist = await Playlist.findOne({ owner: userId });

  const result = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
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
    { $unwind: "$ownerDetails" },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
        },
        videos: {
          $map: {
            input: "$videos",
            as: "videoId",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$videoDetails",
                    as: "video",
                    cond: { $eq: ["$$video._id", "$$videoId"] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
  ]);

  res
    .status(200)
    .json(new apiresponse(200, result, "user playlist is fetched"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlistById = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
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
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videosDetails",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
        },
        videos: {
          $map: {
            input: "$videos",
            as: "videoId",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$videosDetails",
                    as: "video",
                    cond: { $eq: ["$$video._id", "$$videoId"] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
  ]);

  res
    .status(200)
    .json(new apiresponse(200, playlistById, "playlist fetched by id"));
});

const addvideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;
  const userId = req.user?._id;

  if (!playlistId || !videoId || !userId) {
    throw new ApiError(401, "plalistId and videoId and userId are required");
  }

  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new ApiError(400, "Invalid playlist ID or user ID");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(401, "invalid videoId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist.owner.equals(userId)) {
    throw new ApiError(405, "playlist does not exist with this user ");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in the playlist");
  }

  await playlist.videos.push(videoId);

  await playlist.save();

  const finalResult = await Playlist.aggregate([
    { $match: { _id: playlist._id } },
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
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
        },
        videos: {
          $map: {
            input: "$videos",
            as: "videoId",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$videoDetails",
                    as: "video",
                    cond: { $eq: ["$$video._id", "$$videoId"] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiresponse(200, finalResult, "video add successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;
  const userId = req.user?._id;

  if (!playlistId || !videoId || !userId) {
    throw new ApiError(401, "plalistId and videoId and userId are required");
  }

  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new ApiError(400, "Invalid playlist ID or user ID");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(401, "invalid videoId");
  }

  if (!(await Playlist.findOne({ videos: videoId }))) {
    throw new ApiError(405, "already removed from playlist");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: userId },
    { $pull: { videos: new mongoose.Types.ObjectId(videoId) } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you do not have permission to modify this playlist"
    );
  }

  const finalResult = await Playlist.aggregate([
    { $match: { _id: playlist._id } },
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
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
        },
        videos: {
          $map: {
            input: "$videos",
            as: "videoId",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$videoDetails",
                    as: "video",
                    cond: { $eq: ["$$video._id", "$$videoId"] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiresponse(
        200,
        finalResult,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !req.user?._id) {
    throw new ApiError(401, "playlist id and user id are required");
  }

  if (!(await Playlist.findOne({ owner: req.user?._id }))) {
    throw new ApiError(405, "No playlist exist for this user");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res.status(200).json(new apiresponse(200, "playlist deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !name || !description) {
    throw new ApiError(402, "name and description and plalistId are required ");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "invalid user");
  }

  if (!Playlist.findOne({ _id: playlistId, owner: req.user?._id })) {
    throw new ApiError(405, "not playlist exist");
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    name: name,
    description: description,
  });

  if (!playlist) {
    throw new ApiError(405, " unable to update");
  }

  const resultOfUpdate = await Playlist.aggregate([
    { $match: { _id: playlist._id } },
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
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
        },
        videos: {
          $map: {
            input: "$videos",
            as: "videoId",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$videoDetails",
                    as: "video",
                    cond: { $eq: ["$$video._id", "$$videoId"] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiresponse(200, resultOfUpdate, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addvideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
