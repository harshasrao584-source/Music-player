import express from 'express';
import {
  addSong,
  editSong,
  deleteSong,
  getUsers,
  deleteUser,
  getGlobalStats
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Enforce admin permission for all endpoints in this router
router.use(protect);
router.use(adminOnly);

router.route('/songs')
  .post(upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), addSong);

router.route('/songs/:id')
  .put(upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), editSong)
  .delete(deleteSong);

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.route('/stats')
  .get(getGlobalStats);

export default router;
