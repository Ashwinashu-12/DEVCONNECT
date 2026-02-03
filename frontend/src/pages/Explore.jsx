import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, UserPlus } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Explore = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTech, setSelectedTech] = useState('');
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    // Get all unique tech tags
    const allTechTags = [...new Set(users.flatMap(u => u.techStack || []))];

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, selectedTech, users]);

    const fetchUsers = async () => {
        try {
            const response = await userAPI.getAllUsers();
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedTech) {
            filtered = filtered.filter(user =>
                user.techStack?.some(tech =>
                    tech.toLowerCase().includes(selectedTech.toLowerCase())
                )
            );
        }

        setFilteredUsers(filtered);
    };

    const handleFollow = async (userId) => {
        try {
            await userAPI.followUser(userId);
            fetchUsers();
            toast.success('Follow status updated');
        } catch (error) {
            toast.error('Failed to update follow status');
        }
    };

    const isFollowing = (userId) => {
        const user = users.find(u => u._id === currentUser?._id);
        return user?.following?.includes(userId);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="glass-card p-6 space-y-4">
                        <div className="skeleton w-20 h-20 rounded-full mx-auto" />
                        <div className="skeleton h-4 w-32 rounded mx-auto" />
                        <div className="skeleton h-3 w-full rounded" />
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
                    <Users className="mr-3" />
                    Explore Developers
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Discover and connect with talented developers
                </p>
            </motion.div>

            {/* Search and Filter */}
            <div className="glass-card p-6 mb-8 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search developers by name..."
                        className="input-field pl-11"
                    />
                </div>

                {/* Tech Filter */}
                <div>
                    <label className="block text-sm font-medium mb-2">Filter by Tech Stack</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedTech('')}
                            className={`tech-tag ${!selectedTech ? 'ring-2 ring-primary-500' : ''}`}
                        >
                            All
                        </button>
                        {allTechTags.slice(0, 10).map(tech => (
                            <button
                                key={tech}
                                onClick={() => setSelectedTech(tech)}
                                className={`tech-tag ${selectedTech === tech ? 'ring-2 ring-primary-500' : ''}`}
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full glass-card p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold mb-2">No developers found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    filteredUsers.map((user, index) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card p-6 hover:shadow-2xl transition-all duration-300"
                        >
                            <Link to={`/profile/${user._id}`} className="block mb-4">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-primary-500/20 hover:ring-primary-500 transition-all"
                                />
                                <h3 className="text-lg font-semibold text-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    {user.name}
                                </h3>
                            </Link>

                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 line-clamp-2 min-h-[40px]">
                                {user.bio || 'No bio yet'}
                            </p>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[60px]">
                                {user.techStack?.slice(0, 3).map(tech => (
                                    <span key={tech} className="tech-tag text-xs">
                                        {tech}
                                    </span>
                                ))}
                                {user.techStack?.length > 3 && (
                                    <span className="tech-tag text-xs">
                                        +{user.techStack.length - 3}
                                    </span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex justify-around py-3 border-t border-b border-gray-200 dark:border-gray-800 mb-4">
                                <div className="text-center">
                                    <div className="font-semibold text-primary-600 dark:text-primary-400">
                                        {user.followers?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-primary-600 dark:text-primary-400">
                                        {user.following?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
                                </div>
                            </div>

                            {/* Follow Button */}
                            {user._id !== currentUser?._id && (
                                <button
                                    onClick={() => handleFollow(user._id)}
                                    className={`w-full py-2 px-4 rounded-xl font-semibold transition-all ${isFollowing(user._id)
                                            ? 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
                                            : 'btn-gradient'
                                        }`}
                                >
                                    {isFollowing(user._id) ? (
                                        'Following'
                                    ) : (
                                        <span className="flex items-center justify-center space-x-2">
                                            <UserPlus size={18} />
                                            <span>Follow</span>
                                        </span>
                                    )}
                                </button>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Explore;
