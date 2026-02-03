import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Heart, MessageCircle, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [userResponse, postsResponse] = await Promise.all([
                userAPI.getUserById(user._id),
                postAPI.getAllPosts()
            ]);

            const userData = userResponse.data;
            const allPosts = postsResponse.data;
            const userPosts = allPosts.filter(p => p.user._id === user._id);

            setStats({
                ...userData.stats,
                totalPosts: userPosts.length,
                totalLikes: userPosts.reduce((acc, post) => acc + post.likesCount, 0),
                totalComments: userPosts.reduce((acc, post) => acc + post.commentsCount, 0),
                followers: userData.followers?.length || 0,
                following: userData.following?.length || 0,
                projects: userData.projects?.length || 0,
            });
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Posts',
            value: stats?.totalPosts || 0,
            icon: MessageCircle,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            textColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            title: 'Likes Received',
            value: stats?.totalLikes || 0,
            icon: Heart,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            textColor: 'text-red-600 dark:text-red-400',
        },
        {
            title: 'Followers',
            value: stats?.followers || 0,
            icon: Users,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            textColor: 'text-green-600 dark:text-green-400',
        },
        {
            title: 'Following',
            value: stats?.following || 0,
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            textColor: 'text-purple-600 dark:text-purple-400',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card p-6 space-y-4">
                        <div className="skeleton h-12 w-12 rounded-xl" />
                        <div className="skeleton h-8 w-20 rounded" />
                        <div className="skeleton h-4 w-24 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                    <BarChart3 className="mr-3" />
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Track your activity and engagement
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                            <stat.icon className={stat.textColor} size={24} />
                        </div>
                        <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.title}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Profile Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-8"
            >
                <h2 className="text-2xl font-bold mb-6">Profile Summary</h2>

                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-32 h-32 rounded-2xl ring-4 ring-primary-500"
                    />

                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">{user?.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {user?.bio || 'No bio yet'}
                        </p>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                            {user?.techStack?.map(tech => (
                                <span key={tech} className="tech-tag">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* Social Links */}
                        {user?.socialLinks && (
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                {user.socialLinks.github && (
                                    <a
                                        href={user.socialLinks.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        GitHub
                                    </a>
                                )}
                                {user.socialLinks.linkedin && (
                                    <a
                                        href={user.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                                    >
                                        LinkedIn
                                    </a>
                                )}
                                {user.socialLinks.twitter && (
                                    <a
                                        href={user.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors font-medium"
                                    >
                                        Twitter
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Engagement Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-8 mt-6"
            >
                <h2 className="text-2xl font-bold mb-6">Engagement Insights</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-2xl">
                        <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                            {stats?.totalPosts > 0 ? Math.round(stats.totalLikes / stats.totalPosts) : 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Avg. Likes per Post
                        </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-2xl">
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                            {stats?.totalComments || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total Comments
                        </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-2xl">
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                            {stats?.projects || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Projects Showcased
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
