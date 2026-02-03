import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name avatar')
            .populate('postId', 'content')
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
