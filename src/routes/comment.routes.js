import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middlewar.js";
import { addComment, deleteComment, updateComment } from "../controller/comment.controller.js";

const router = Router();

router.route('/add-comment/:videoId').post(verifyjwt,addComment)
router.route('/update-comment/:id').patch(verifyjwt,updateComment)
router.route('/delete-comment/:id').delete(verifyjwt,deleteComment)


export default router;