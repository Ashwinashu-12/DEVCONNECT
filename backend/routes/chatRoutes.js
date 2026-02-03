import express from 'express';
import { getConversations, getMessages, createOrGetConversation } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/conversation', createOrGetConversation);

export default router;
