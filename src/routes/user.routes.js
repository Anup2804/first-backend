import { Router } from "express";
import {
    currentUser,
  loginUser,
  logoutUser,
  newRefreshAccessToken,
  requestUser,
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
  requestUser
);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyjwt, logoutUser);
router.route('/refresh-token').post(newRefreshAccessToken)


router.route('/user-data').get(currentUser)

export default router;
