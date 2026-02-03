import express from 'express';
import {
    createProject,
    getProjectsByUserId,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createProject);
router.get('/:userId', getProjectsByUserId);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

export default router;
