import express from 'express';
import { getListeningHistory, clearListeningHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All history routes require authentication

router.route('/')
  .get(getListeningHistory)
  .delete(clearListeningHistory);

export default router;
