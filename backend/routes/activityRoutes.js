import express from 'express';
import { getUserActivity } from '../controllers/activityController.js';

const router = express.Router();

router.get('/:userId', getUserActivity);

export default router;
