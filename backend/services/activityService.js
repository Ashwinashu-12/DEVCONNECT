import Activity from '../models/Activity.js';

/**
 * Logs a new user activity asynchronously
 * @param {Object} data - Activity data
 */
export const logActivity = async (data) => {
    try {
        const { user, type, targetUser, postId, projectId, text } = data;

        // Validation for duplicates / spam
        if (type === 'like' || type === 'follow') {
            const lastActivity = await Activity.findOne({ user, type, postId, targetUser, projectId })
                .sort({ createdAt: -1 });

            // If the same activity was logged recently (last 5 mins), skip it to avoid spam
            if (lastActivity && (Date.now() - new Date(lastActivity.createdAt).getTime()) < 300000) {
                return;
            }
        }

        // Limit activities per user to 100 for storage scalability
        const activityCount = await Activity.countDocuments({ user });
        if (activityCount >= 100) {
            const oldestActivity = await Activity.findOne({ user }).sort({ createdAt: 1 });
            if (oldestActivity) {
                await Activity.findByIdAndDelete(oldestActivity._id);
            }
        }

        await Activity.create({
            user,
            type,
            targetUser,
            postId,
            projectId,
            text
        });
    } catch (error) {
        // Silently log error to avoid breaking the main application flow
        console.error('Error logging activity:', error.message);
    }
};
