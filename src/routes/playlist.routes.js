import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { addvideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controller/playlist.controller.js";


const router = Router();


router.route('/create-playlist').post(verifyjwt,createPlaylist)

router.route('/user-playlist').get(verifyjwt,getUserPlaylist)

router.route('/c/:playlistId').get(verifyjwt,getPlaylistById)

router.route('/add-video/:playlistId').post(verifyjwt,addvideoToPlaylist)

router.route('/delete-video/:playlistId').delete(verifyjwt,removeVideoFromPlaylist)

router.route('/delete-playlist/:playlistId').delete(verifyjwt,deletePlaylist)

router.route('/update-playlist/:playlistId').patch(verifyjwt,updatePlaylist)




export default router