import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { apiresponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadoncloudnary } from "../utils/cloudnary/cloudnary.js";

const publishVideo = asyncHandler(async (req, res) => {
  // user should be logged in (add middleware verify jwt)
  // get data from req.body
  // check if title ,video,thumbnail,description,time is present.
  // check video and thumbnal is present.
  // use multter and upload on cloudnary and store a url.
  // set data in to database and save.
  const { title, description, time } = req.body;

  if (!title && !description && !time) {
    throw new ApiError(401, "title or description or time is missing");
  }

  const videoLocalPath = req.files?.videofile[0]?.path;
  console.log(videoLocalPath);

  if (!videoLocalPath) {
    throw new ApiError(401, "video is required.");
  }

  const video = await uploadoncloudnary(videoLocalPath);
  console.log(video);

  if (!video) {
    throw new ApiError(401, "video is missing.");
  }

  const videos = await Video.create({
    videofile: video.url,
    title,
    description,
    time: video.duration,
    owner: req.user_id,
  });

  await videos.save();

  if (!videos) {
    throw new ApiError(500, "error in saving the data");
  }

  return res
    .status(200)
    .json(new apiresponse(200, videos, "video uploaded successfully"));
});

const getAllvideo = asyncHandler(async (req, res) => {
  // have a facilty of pagination
  const video = await Video.find();

  if (!video || video.length === 0) {
    throw new ApiError(500, "video data not found.");
  }

  return res
    .status(200)
    .json(new apiresponse(200, video, "video data fetched."));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(401, "video id is invaild");
  }

  const videoById = await Video.findById(videoId);

  if (!videoById) {
    throw new ApiError(500, "video by this Id not found or is deleted");
  }

  return res.status(200).json(new apiresponse(200, videoById, "video found"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const videoLocalpath = req.file?.path;
  if (!videoLocalpath) {
    throw new ApiError(402, "video file missing");
  }

  const video = await uploadoncloudnary(videoLocalpath);

  if (!video) {
    throw new ApiError(400, "Error is uploading video");
  }

  const newVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        videofile: video.url,
      },
    },
    { new: true }
  );

  return res.status(200).json(new apiresponse(200, newVideo, "video updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(401, "invaild id");
  }

  const video = await Video.findByIdAndDelete(id);

  if(!video){
    throw new ApiError(500,"video not found")
  }

  res.status(200).json(new apiresponse(200, "video deleted"));
});

export { publishVideo, getAllvideo, getVideoById, updateVideo,deleteVideo };
