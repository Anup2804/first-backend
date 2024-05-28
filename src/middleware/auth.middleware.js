import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
dotenv.config();

export const verifyjwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log(token)

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }
    const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log(decodedtoken)

    const user = await User.findById(decodedtoken?._id).select(
      "-password -refreshtoken"
    );

    if (!user) {
      throw new ApiError(401, "invaild accesstoken");
    }

    req.user = user;
    //   console.log(req.user);
    next();
  } catch (error) {
    throw new ApiError(401, "invalid accesstoken");
  }
});
