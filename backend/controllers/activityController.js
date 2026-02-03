import Activity from '../models/Activity.js';

export const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        const activities = await Activity.find({ user: userId })
            .populate('user', 'name avatar')
            .populate('targetUser', 'name avatar')
            .populate('postId', 'content')
            .populate('projectId', 'title')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
