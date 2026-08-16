import express from 'express';
import {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs
} from '../controllers/playlistController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserPlaylists)
  .post(protect, createPlaylist);

router.route('/:id')
  .get(optionalProtect, getPlaylistById)
  .put(protect, updatePlaylist)
  .delete(protect, deletePlaylist);

router.route('/:id/songs')
  .post(protect, addSongToPlaylist);

router.route('/:id/songs/:songId')
  .delete(protect, removeSongFromPlaylist);

router.route('/:id/reorder')
  .put(protect, reorderPlaylistSongs);

export default router;
