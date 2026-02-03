import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.userId
        })
            .populate('participants', 'name avatar')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'name' }
            })
            .sort({ updatedAt: -1 });

        // Calculate unread count for each conversation
        const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                receiver: req.userId,
                read: false
            });
            return {
                ...conv.toObject(),
                unreadCount
            };
        }));

        res.json(enrichedConversations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate('sender', 'name avatar')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createOrGetConversation = async (req, res) => {
    try {
        const { receiverId } = req.body;

        let conversation = await Conversation.findOne({
            participants: { $all: [req.userId, receiverId] }
        })
            .populate('participants', 'name avatar')
            .populate('lastMessage');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.userId, receiverId]
            });
            conversation = await conversation.populate('participants', 'name avatar');
        }

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
