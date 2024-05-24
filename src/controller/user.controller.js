import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadoncloudnary } from "../utils/cloudnary/cloudnary.js";
import { apiresponse } from "../utils/apiResponse.js";

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
  // console.log(req.files);

  const coverimagelocalpath = req.files?.coverimage[0]?.path;
  console.log(coverimagelocalpath);
  // console.log(req.files);

  if (!avatarlocalpath) {
    throw new ApiError(400, "avatar file is required.");
  }

  const avatar = await uploadoncloudnary(avatarlocalpath);
  const coverimage = await uploadoncloudnary(coverimagelocalpath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required.");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage:coverimage?.url || '',
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
    .json(new apiresponse(200, createduser, "user registered properly."));
});

export { requestUser };
