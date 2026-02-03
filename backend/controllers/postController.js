import Post from '../models/Post.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';
import { logActivity } from '../services/activityService.js';

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name avatar techStack')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 });

        // Add virtual-like fields for frontend compatibility
        const postsWithCounts = posts.map(post => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length
        }));

        res.json(postsWithCounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const { content, techTags } = req.body;
        const userId = req.userId;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Parse techTags if they come as a string (from FormData)
        let processedTags = [];
        if (techTags) {
            processedTags = Array.isArray(techTags) ? techTags : JSON.parse(techTags);
        }

        const post = await Post.create({
            user: userId,
            content,
            techTags: processedTags,
            image: req.file ? req.file.path : null
        });

        const populatedPost = await Post.findById(post._id).populate('user', 'name avatar techStack');

        // Log Activity
        logActivity({
            user: userId,
            type: 'post',
            postId: post._id,
            text: 'created a new post'
        });

        res.status(201).json({
            message: 'Post created successfully',
            post: {
                ...populatedPost.toObject(),
                likesCount: 0,
                commentsCount: 0,
                techTags: processedTags
            }
        });
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        let post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership
        if (post.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        post.content = content || post.content;
        await post.save();

        res.json({
            message: 'Post updated successfully',
            post
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Post.findByIdAndDelete(id);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // Unlike
            await Post.findByIdAndUpdate(id, { $pull: { likes: userId } });
            const updatedPost = await Post.findById(id);
            res.json({
                message: 'Post unliked',
                isLiked: false,
                likesCount: updatedPost.likes.length
            });
        } else {
            // Like
            await Post.findByIdAndUpdate(id, { $push: { likes: userId } });
            const updatedPost = await Post.findById(id);

            // Notify post owner
            const user = await User.findById(userId).select('name');
            await createNotification({
                recipient: updatedPost.user,
                sender: userId,
                type: 'like',
                postId: id,
                text: `${user.name} liked your post`
            });

            // Log Activity (if not self-like)
            if (updatedPost.user.toString() !== userId) {
                logActivity({
                    user: userId,
                    type: 'like',
                    postId: id,
                    targetUser: updatedPost.user,
                    text: `liked ${updatedPost.user.name}'s post`
                });
            }

            res.json({
                message: 'Post liked',
                isLiked: true,
                likesCount: updatedPost.likes.length
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const comment = {
            user: userId,
            text: content,
            createdAt: Date.now()
        };

        const post = await Post.findByIdAndUpdate(
            id,
            { $push: { comments: comment } },
            { new: true }
        ).populate('comments.user', 'name avatar');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Notify post owner
        const user = await User.findById(userId).select('name');
        await createNotification({
            recipient: post.user,
            sender: userId,
            type: 'comment',
            postId: id,
            text: `${user.name} commented on your post`
        });

        // Log Activity
        logActivity({
            user: userId,
            type: 'comment',
            postId: id,
            targetUser: post.user,
            text: `commented on a post by ${post.user.name}`
        });

        const latestComment = post.comments[post.comments.length - 1];

        res.status(201).json({
            message: 'Comment added successfully',
            comment: latestComment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFeed = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const following = currentUser.following || [];
        const techStack = currentUser.techStack || [];

        // Bonus: If no followings, we can show trending posts (most likes last 24h)
        // We'll adjust the pipeline slightly if following is empty
        const isTrendingMode = following.length === 0;

        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    isFollowingAuthor: {
                        $in: [{ $ifNull: ['$user._id', null] }, following]
                    },
                    likesCount: { $size: { $ifNull: ['$likes', []] } },
                    commentsCount: { $size: { $ifNull: ['$comments', []] } },
                    hoursSincePosted: {
                        $max: [
                            0.1,
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $ifNull: ['$createdAt', new Date()] }] },
                                    3600000
                                ]
                            }
                        ]
                    },
                    interestMatch: {
                        $size: {
                            $setIntersection: [{ $ifNull: ['$techTags', []] }, techStack]
                        }
                    }
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            { $multiply: [{ $cond: ['$isFollowingAuthor', 1, 0] }, 5] },
                            { $multiply: ['$likesCount', 2] },
                            { $multiply: ['$commentsCount', 3] },
                            { $multiply: ['$interestMatch', 4] },
                            { $multiply: [{ $subtract: [100, { $min: ['$hoursSincePosted', 100] }] }, 0.1] }
                        ]
                    }
                }
            },
            { $sort: { score: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        const posts = await Post.aggregate(pipeline);

        // Final cleanup for safety
        const cleanedPosts = posts.map(post => ({
            ...post,
            user: post.user || { name: 'Unknown User', avatar: '' },
            likesCount: post.likesCount || 0,
            commentsCount: post.commentsCount || 0
        }));

        res.json(cleanedPosts);
    } catch (error) {
        console.error('Feed Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
