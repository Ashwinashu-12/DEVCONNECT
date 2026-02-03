import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Github,
    Linkedin,
    Twitter,
    MapPin,
    Calendar,
    UserPlus,
    UserMinus,
    Edit,
    ExternalLink,
    Plus
} from 'lucide-react';
import { userAPI, projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/Post/PostCard';
import toast from 'react-hot-toast';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        techStack: '',
        liveUrl: '',
        githubUrl: ''
    });

    const isOwnProfile = currentUser?._id === id;

    useEffect(() => {
        fetchProfile();
        fetchProjects();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await userAPI.getUserById(id);
            setProfile(response.data);
            setIsFollowing(response.data.followers?.includes(currentUser?._id));
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await projectAPI.getProjectsByUserId(id);
            setProjects(response.data);
        } catch (error) {
            console.error('Failed to load projects');
        }
    };

    const handleFollow = async () => {
        try {
            await userAPI.followUser(id);
            setIsFollowing(!isFollowing);
            fetchProfile();
            toast.success(isFollowing ? 'Unfollowed' : 'Followed');
        } catch (error) {
            toast.error('Failed to update follow status');
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            const techStackArray = newProject.techStack.split(',').map(t => t.trim()).filter(Boolean);
            await projectAPI.createProject({
                ...newProject,
                techStack: techStackArray
            });
            setShowProjectModal(false);
            setNewProject({ title: '', description: '', techStack: '', liveUrl: '', githubUrl: '' });
            fetchProjects();
            toast.success('Project added! 🎉');
        } catch (error) {
            toast.error('Failed to add project');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="glass-card p-8">
                    <div className="skeleton w-32 h-32 rounded-2xl mx-auto mb-4" />
                    <div className="skeleton h-6 w-48 rounded mx-auto mb-2" />
                    <div className="skeleton h-4 w-64 rounded mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 mb-6"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    {/* Avatar */}
                    <img
                        src={profile?.avatar}
                        alt={profile?.name}
                        className="w-32 h-32 rounded-2xl ring-4 ring-primary-500 shadow-xl"
                    />

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <h1 className="text-3xl font-bold mb-2 md:mb-0">{profile?.name}</h1>

                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollow}
                                    className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-semibold transition-all ${isFollowing
                                            ? 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
                                            : 'btn-gradient'
                                        }`}
                                >
                                    {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                                    <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                                </button>
                            )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {profile?.bio || 'No bio yet'}
                        </p>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start space-x-8 mb-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {profile?.stats?.postsCount || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {profile?.followers?.length || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {profile?.following?.length || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {profile?.stats?.likesReceived || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {profile?.techStack?.map(tech => (
                                    <span key={tech} className="tech-tag">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        {profile?.socialLinks && (
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                {profile.socialLinks.github && (
                                    <a
                                        href={profile.socialLinks.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Github size={18} />
                                        <span>GitHub</span>
                                    </a>
                                )}
                                {profile.socialLinks.linkedin && (
                                    <a
                                        href={profile.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        <Linkedin size={18} />
                                        <span>LinkedIn</span>
                                    </a>
                                )}
                                {profile.socialLinks.twitter && (
                                    <a
                                        href={profile.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
                                    >
                                        <Twitter size={18} />
                                        <span>Twitter</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Projects Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 mb-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Projects</h2>
                    {isOwnProfile && (
                        <button
                            onClick={() => setShowProjectModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 btn-gradient"
                        >
                            <Plus size={18} />
                            <span>Add Project</span>
                        </button>
                    )}
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📁</div>
                        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isOwnProfile ? 'Add your first project to showcase your work' : 'No projects to display'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl hover:shadow-lg transition-all"
                            >
                                <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.techStack?.map(tech => (
                                        <span key={tech} className="tech-tag text-xs">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex space-x-3">
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                        >
                                            <ExternalLink size={14} />
                                            <span>Live Demo</span>
                                        </a>
                                    )}
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                                        >
                                            <Github size={14} />
                                            <span>Code</span>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Posts Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-2xl font-bold mb-6">Posts</h2>

                {profile?.posts?.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isOwnProfile ? 'Share your first post!' : 'No posts to display'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {profile?.posts?.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Add Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 max-w-md w-full"
                    >
                        <h2 className="text-2xl font-bold mb-6">Add New Project</h2>

                        <form onSubmit={handleAddProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Project Title</label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="input-field resize-none"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tech Stack (comma-separated)</label>
                                <input
                                    type="text"
                                    value={newProject.techStack}
                                    onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                                    className="input-field"
                                    placeholder="React, Node.js, MongoDB"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Live URL (optional)</label>
                                <input
                                    type="url"
                                    value={newProject.liveUrl}
                                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">GitHub URL (optional)</label>
                                <input
                                    type="url"
                                    value={newProject.githubUrl}
                                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button type="submit" className="flex-1 btn-gradient">
                                    Add Project
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(false)}
                                    className="flex-1 py-3 px-6 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Profile;
