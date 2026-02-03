import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

const testPipeline = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found to test with');
            process.exit(0);
        }

        const userId = user._id;
        const following = user.following || [];
        const techStack = user.techStack || [];

        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $addFields: {
                    isFollowingAuthor: {
                        $in: ['$user._id', following]
                    },
                    likesCount: { $size: { $ifNull: ['$likes', []] } },
                    commentsCount: { $size: { $ifNull: ['$comments', []] } },
                    hoursSincePosted: {
                        $max: [
                            0.1,
                            {
                                $divide: [
                                    { $subtract: [new Date(), '$createdAt'] },
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
                        $subtract: [
                            {
                                $add: [
                                    { $multiply: [{ $cond: ['$isFollowingAuthor', 1, 0] }, 5] },
                                    { $multiply: ['$likesCount', 2] },
                                    { $multiply: ['$commentsCount', 3] },
                                    { $multiply: ['$interestMatch', 4] }
                                ]
                            },
                            { $multiply: ['$hoursSincePosted', 0.5] }
                        ]
                    }
                }
            },
            { $sort: { score: -1, createdAt: -1 } },
            { $limit: 10 }
        ];

        const results = await Post.aggregate(pipeline);
        console.log('Results count:', results.length);
        if (results.length > 0) {
            console.log('Top post score:', results[0].score);
        }

        process.exit(0);
    } catch (error) {
        console.error('Pipeline Error:', error);
        process.exit(1);
    }
};

testPipeline();
