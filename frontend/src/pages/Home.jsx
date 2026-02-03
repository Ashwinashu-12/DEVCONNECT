import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CreatePost from '../components/Post/CreatePost';
import PostCard from '../components/Post/PostCard';
import { postAPI } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await postAPI.getAllPosts();
            setPosts(response.data);
        } catch (error) {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handlePostDeleted = (postId) => {
        setPosts(posts.filter(post => post._id !== postId));
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-6 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="skeleton w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-4 w-32 rounded" />
                                <div className="skeleton h-3 w-24 rounded" />
                            </div>
                        </div>
                        <div className="skeleton h-20 w-full rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Feed</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    See what developers are building and sharing
                </p>
            </motion.div>

            <CreatePost onPostCreated={handlePostCreated} />

            <div className="space-y-6">
                {posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-12 text-center"
                    >
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Be the first to share something!
                        </p>
                    </motion.div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onUpdate={fetchPosts}
                            onDelete={handlePostDeleted}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;
