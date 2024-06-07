import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {});

const getUserPlaylist = asyncHandler(async (req, res) => {});

const getPlaylistById = asyncHandler(async (req, res) => {});

const addvideoToPlaylist = asyncHandler(async (req, res) => {});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {});

const deletePlaylist = asyncHandler(async (req, res) => {});

const updatePlaylist = asyncHandler(async (req, res) => {});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addvideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
