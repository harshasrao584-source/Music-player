import express from 'express';
import { getFavoriteSongs, toggleFavoriteSong, checkFavoriteStatus } from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All favorites routes require authentication

router.get('/', getFavoriteSongs);
router.post('/toggle/:songId', toggleFavoriteSong);
router.get('/status/:songId', checkFavoriteStatus);

export default router;
