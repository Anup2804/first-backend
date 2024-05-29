import { Router } from "express";
import {
  changeCurrentPassword,
  getAllUsers,
  getLoggedInUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  newRefreshAccessToken,
  registerUser,
  updateAvatar,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middlewar.js";
import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyjwt, logoutUser);
router.route("/refresh-token").post(newRefreshAccessToken);
router.route("/all-user").get(getAllUsers);
router.route("/user-data").get(verifyjwt, getLoggedInUser);
router.route("/change-password").post(verifyjwt, changeCurrentPassword);
// router.route('/update-avatar').post(verifyjwt,updateAvatar)

router
  .route("/update-avatar")
  .patch(verifyjwt, upload.single("avatar"), updateAvatar);

router.route("/c/:username").get(verifyjwt, getUserChannelProfile); //this is a params route.

router.route("/history").get(verifyjwt, getWatchHistory);

export default router;
