import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Auth endpoints
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

// User endpoints
export const userAPI = {
    getAllUsers: (params) => api.get('/users', { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    followUser: (id) => api.post(`/users/follow/${id}`),
};

// Post endpoints
export const postAPI = {
    getAllPosts: () => api.get('/posts'),
    createPost: (data) => api.post('/posts', data),
    updatePost: (id, data) => api.put(`/posts/${id}`, data),
    deletePost: (id) => api.delete(`/posts/${id}`),
    likePost: (id) => api.post(`/posts/like/${id}`),
    commentOnPost: (id, data) => api.post(`/posts/comment/${id}`, data),
};

// Project endpoints
export const projectAPI = {
    createProject: (data) => api.post('/projects', data),
    getProjectsByUserId: (userId) => api.get(`/projects/${userId}`),
    updateProject: (id, data) => api.put(`/projects/${id}`, data),
    deleteProject: (id) => api.delete(`/projects/${id}`),
};

export default api;
