import express from 'express';
import {
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    commentOnPost,
    getFeed
} from '../controllers/postController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.get('/feed', authMiddleware, getFeed);
router.get('/', getAllPosts);
router.post('/', authMiddleware, upload.single('image'), createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/like/:id', authMiddleware, likePost);
router.post('/comment/:id', authMiddleware, commentOnPost);

export default router;
