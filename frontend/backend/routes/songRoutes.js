import express from 'express';
import { getAllSongs, getGenres, getSongById, trackPlayback } from '../controllers/songController.js';

const router = express.Router();

router.get('/', getAllSongs);
router.get('/genres', getGenres);
router.get('/:id', getSongById);
router.post('/:id/play', trackPlayback);

export default router;
