import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadoncloudnary } from "../utils/cloudnary/cloudnary.js";
import { apiresponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const generateAccessTokenAndRefreshToken = async (userId) => {
  // This function generates the access token for user after login.
  try {
    const user = await User.findById(userId);
    const generateAccessToken = user.generateAccessToken();
    const generateRefreshToken = user.generateRefreshToken();

    user.refreshtoken = generateRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { generateAccessToken, generateRefreshToken };
  } catch (err) {
    throw new ApiError(500, "something went worng");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend.
  // validation-not empty.
  // check if user already exist: username or email.
  // check for  images ,avatar is needed.
  // upload image on cloudnary.
  // create object of user - create in db.
  // remove the password and refreshtoken.
  // check for user creation.
  // return res

  const { fullname, email, username, password } = req.body;
  console.log("email:", email);

  if (email === "") {
    throw new ApiError(400, "email is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }], //this is industry standards.
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username exist.");
  }

  const avatarlocalpath = req.files?.avatar[0]?.path;
  console.log(avatarlocalpath);
  // use the above code when image unloading is required.
  // console.log(req.files);

  // const coverimagelocalpath = req.files?.coverimage[0]?.path;
  // console.log(coverimagelocalpath);
  // console.log(req.files);

  let coverimagelocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimagelocalpath = req.files.coverimage[0].path;
    console.log(coverimagelocalpath);
    // use this code when image uploading in optional.
  }

  if (!avatarlocalpath) {
    throw new ApiError(400, "avatar file is required.");
  }

  const avatar = await uploadoncloudnary(avatarlocalpath);
  const coverimage = await uploadoncloudnary(coverimagelocalpath);

  if (!avatar) {
    throw new ApiError(401, "avatar image is required.");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  if (!createduser) {
    throw new ApiError(500, "something went worng while registering the user.");
  }

  return res
    .status(200)
    .json(new apiresponse(200, createduser, "user registered successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  // take data from user by ui.
  // find the user exist or not.
  // check password entered is correct or not.
  // if password is worng then through error.
  // if correct then give access and refresh token.
  // send cookie.

  const { email, username, password } = req.body;
  // console.log("username:", username);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const getUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!getUser) {
    throw new ApiError(404, "username of email does not exist.");
  }

  const password_valid = await getUser.isPasswordCorrect(password);

  if (!password_valid) {
    throw new ApiError(404, "password is invaild.");
  }

  const { generateAccessToken, generateRefreshToken } =
    await generateAccessTokenAndRefreshToken(getUser._id);

  const loggedinUser = await User.findById(getUser._id).select(
    "-password -refreshtoken"
  );

  const option = {
    httpOnly: true,
    secure: true,
    // sameSite: 'strict',
  };

  return res
    .status(200)
    .cookie("accessToken", generateAccessToken, option)
    .cookie("refreshtoken", generateRefreshToken, option)
    .json(
      new apiresponse(
        200,
        { user: loggedinUser, generateAccessToken, generateRefreshToken },
        "user login successful."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  req.user._id;
  // console.log(req.user)
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: "",
      },
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshtoken", option)
    .json(new apiresponse(200, {}, "User logout successful"));
});

const newRefreshAccessToken = asyncHandler(async (req, res) => {
  // the problem in postman of duplicate accesstoken is getting  from here.
  const incomingRefreshToken =
    req.cookies.refreshtoken || req.body.refreshtoken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "invaild request");
  }

  try {
    const decodedtoken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedtoken?._id);

    if (!user) {
      throw new ApiError(401, "invaild refresh token");
    }

    if (incomingRefreshToken !== user?.refreshtoken) {
      throw new ApiError(401, "Refresh Token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { generateAccessToken, generateRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return (
      res
        .status(200)
        // .cookie("accesstoken", generateAccessToken, options)
        .cookie("refreshtoken", generateRefreshToken, options)
        .json(
          new apiresponse(
            200,
            { accesstoken, refreshtoken },
            "refreshtoken generated"
          )
        )
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "invaild refresh token.");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const passwordChecked = await user.isPasswordCorrect(oldPassword);
  if (!passwordChecked) {
    throw new ApiError(401, "incorrect password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiresponse(200, "password changed successfully"));
});

const getLoggedInUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password -refreshtoken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new apiresponse(200, user, "Logged-in user details fetched successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshtoken");
  if (!users || users.length === 0) {
    throw new ApiError(404, "No users found.");
  }
  return res
    .status(200)
    .json(new apiresponse(200, users, "Users fetched successfully."));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalpath = req.file?.path;
  if (!avatarLocalpath) {
    throw new ApiError(402, "avatar file missing");
  }

  const avatar = await uploadoncloudnary(avatarLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Error is uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiresponse(200, user, "avatar image updated"));
});

// also make a coverimage function for update

// The below function is made to right the aggreation pipeline.

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // This function aggregates the subscribers and users collections
  // and also contains the pipeline for channels you subscribed to and users
  // that subscribed to your channel, along with some other logic.

  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscribers",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscribers",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelSubscribedToCount: { $size: "$subscribedTo" },
        IsSubscribed: {
          $in: [req.user._id, "$subscribers.subscriber"],
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        IsSubscribed: 1,
        avatar: 1,
        coverimage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
    .status(200)
    .json(
      new apiresponse(200, channel[0], "user channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        // this part is called subpipeline.
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $arrayElemAt: ["$owner", 0],
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiresponse(
        200,
        user[0].watchHistory,
        "Watch history fetched sucessfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  newRefreshAccessToken,
  changeCurrentPassword,
  getLoggedInUser,
  getAllUsers,
  updateAvatar,
  getUserChannelProfile,
  getWatchHistory,
};
