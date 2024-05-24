import { Router } from "express";
import {requestUser} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middlewar.js";


const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:'coverimage',
            maxCount:1
        }
    ]),
    requestUser);

export default router;