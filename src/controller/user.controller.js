import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadoncloudnary } from "../utils/cloudnary/cloudnary.js";
import { apiresponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

const requestUser = asyncHandler(async (req, res) => {
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
    .json(new apiresponse(200, "User logout successful"));
});

const newRefreshAccessToken = asyncHandler(async (req, res) => {
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

    return res
      .status(200)
      .cookie("accesstoken", generateAccessToken, options)
      .cookie("refreshtoken", generateRefreshToken, options)
      .json(
        new apiresponse(
          200,
          {accesstoken, refreshtoken },
          "refreshtoken generated"
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

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.body, "current user fetched successfully");
});

export {
  requestUser,
  loginUser,
  logoutUser,
  newRefreshAccessToken,
  changeCurrentPassword,
  currentUser,
};
