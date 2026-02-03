import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import { formatTimeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PostCard = ({ post, onUpdate, onDelete }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);

    const handleLike = async () => {
        try {
            const response = await postAPI.likePost(post._id);
            setIsLiked(response.data.isLiked);
            setLikesCount(response.data.likesCount);
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const response = await postAPI.commentOnPost(post._id, { content: comment });
            setComments([...comments, response.data.comment]);
            setComment('');
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const handleEdit = async () => {
        try {
            await postAPI.updatePost(post._id, { content: editContent });
            onUpdate && onUpdate();
            setIsEditing(false);
            toast.success('Post updated');
        } catch (error) {
            toast.error('Failed to update post');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await postAPI.deletePost(post._id);
                onDelete && onDelete(post._id);
                toast.success('Post deleted');
            } catch (error) {
                toast.error('Failed to delete post');
            }
        }
    };

    const isOwner = user?._id === post.user?._id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 hover:shadow-2xl transition-shadow duration-300"
        >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
                <Link to={`/profile/${post.user?._id}`} className="flex items-center space-x-3 group">
                    <img
                        src={post.user?.avatar}
                        alt={post.user?.name}
                        className="w-12 h-12 rounded-full ring-2 ring-primary-500 group-hover:ring-4 transition-all"
                    />
                    <div>
                        <h3 className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {post.user?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(post.createdAt)}
                        </p>
                    </div>
                </Link>

                {isOwner && !isEditing && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Post Content */}
            {isEditing ? (
                <div className="mb-4">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input-field min-h-[100px] resize-none"
                    />
                    <div className="flex space-x-2 mt-2">
                        <button onClick={handleEdit} className="btn-gradient text-sm py-2 px-4">
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(post.content);
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </p>
            )}

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 transition-all ${isLiked
                            ? 'text-red-500'
                            : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                        }`}
                >
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                    <span className="font-medium">{likesCount}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                    <MessageCircle size={20} />
                    <span className="font-medium">{comments.length}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4"
                >
                    {/* Comment Form */}
                    <form onSubmit={handleComment} className="flex space-x-2">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="input-field flex-1"
                        />
                        <button
                            type="submit"
                            className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex space-x-3">
                                <img
                                    src={comment.user?.avatar}
                                    alt={comment.user?.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm">{comment.user?.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default PostCard;
