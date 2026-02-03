import Notification from '../models/Notification.js';
import { getIO } from '../socket.js';

/**
 * Creates a notification, saves it to DB, and emits it via socket.io
 * @param {Object} data - Notification data (recipient, sender, type, postId, text)
 */
export const createNotification = async (data) => {
    try {
        const { recipient, sender, type, postId, text } = data;

        // Prevent notifying self
        if (recipient.toString() === sender.toString()) return;

        // Prevention of duplicate notifications (e.g., multiple likes on same post)
        // For likes and follows, we might want to avoid spamming
        if (type === 'like' || type === 'follow') {
            const existing = await Notification.findOne({
                recipient,
                sender,
                type,
                postId,
                createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24h
            });
            if (existing) return;
        }

        const notification = await Notification.create({
            recipient,
            sender,
            type,
            postId,
            text
        });

        const populatedNotification = await notification.populate('sender', 'name avatar');

        // Emit real-time event
        const io = getIO();
        io.to(recipient.toString()).emit('newNotification', populatedNotification);

        // Also emit unread count update
        const unreadCount = await Notification.countDocuments({ recipient, read: false });
        io.to(recipient.toString()).emit('unreadCountUpdate', { count: unreadCount });

        return populatedNotification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
