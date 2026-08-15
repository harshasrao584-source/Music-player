import express from 'express';
import { getPersonalizedRecommendations, getMoodRecommendations } from '../controllers/recommendationController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/personalized', protect, getPersonalizedRecommendations);
router.get('/mood', optionalProtect, getMoodRecommendations);

export default router;
