import User from '../models/User.js';
import Post from '../models/Post.js';
import Project from '../models/Project.js';
import { createNotification } from '../services/notificationService.js';
import { logActivity } from '../services/activityService.js';

export const getAllUsers = async (req, res) => {
    try {
        const { search, techStack } = req.query;
        let query = {};

        // Search by name (case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Filter by tech stack (array contains)
        if (techStack) {
            query.techStack = { $regex: techStack, $options: 'i' };
        }

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format (avoid crashing on old mock IDs)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid user ID format. Please log in again.' });
        }

        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's posts and projects
        const [userPosts, userProjects] = await Promise.all([
            Post.find({ user: id }).populate('user', 'name avatar'),
            Project.find({ userId: id })
        ]);

        // Calculate likes received (sum of likes on all posts)
        const likesReceived = userPosts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);

        res.json({
            ...user.toObject(),
            posts: userPosts,
            projects: userProjects,
            stats: {
                postsCount: userPosts.length,
                projectsCount: userProjects.length,
                followersCount: user.followers?.length || 0,
                followingCount: user.following?.length || 0,
                likesReceived
            }
        });
    } catch (error) {
        console.error('getUserById error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // From auth middleware

        if (id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { name, bio, techStack, socialLinks, avatar } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    name,
                    bio,
                    techStack,
                    socialLinks,
                    avatar,
                    updatedAt: Date.now()
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const followUser = async (req, res) => {
    try {
        const { id: targetId } = req.params; // User to follow
        const currentUserId = req.userId; // Current user

        if (targetId === currentUserId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const targetUser = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(targetId);

        if (isFollowing) {
            // Unfollow - Atomic update
            await Promise.all([
                User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } }),
                User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } })
            ]);

            res.json({ message: 'Unfollowed successfully', isFollowing: false });
        } else {
            // Follow - Atomic update
            await Promise.all([
                User.findByIdAndUpdate(currentUserId, { $push: { following: targetId } }),
                User.findByIdAndUpdate(targetId, { $push: { followers: currentUserId } })
            ]);

            // Notify target user
            await createNotification({
                recipient: targetId,
                sender: currentUserId,
                type: 'follow',
                text: `${currentUser.name} started following you`
            });

            // Log Activity
            logActivity({
                user: currentUserId,
                type: 'follow',
                targetUser: targetId,
                text: `started following ${targetUser.name}`
            });

            res.json({ message: 'Followed successfully', isFollowing: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
