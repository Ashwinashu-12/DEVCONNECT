import express from 'express';
import { getGithubData } from '../controllers/githubController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to fetch GitHub data
router.get('/:username', authMiddleware, getGithubData);

export default router;
