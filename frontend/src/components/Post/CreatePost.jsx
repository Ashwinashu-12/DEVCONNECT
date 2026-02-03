import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { postAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            const response = await postAPI.createPost({ content });
            setContent('');
            onPostCreated && onPostCreated(response.data.post);
            toast.success('Post created! 🎉');
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your coding journey, insights, or ask questions... 💭"
                    className="input-field min-h-[120px] resize-none"
                    disabled={loading}
                />

                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {content.length} characters
                    </p>

                    <button
                        type="submit"
                        disabled={!content.trim() || loading}
                        className="btn-gradient flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                        <span>{loading ? 'Posting...' : 'Post'}</span>
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default CreatePost;
