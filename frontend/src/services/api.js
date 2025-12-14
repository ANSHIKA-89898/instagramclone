import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

// Posts APIs
export const postsAPI = {
  create: (data) => api.post('/posts', data),
  getById: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  delete: (id) => api.delete(`/posts/${id}`),
};

// Feed API
export const feedAPI = {
  getFeed: (params) => api.get('/feed', { params }),
};

// Likes APIs
export const likesAPI = {
  like: (postId) => api.post(`/likes/${postId}`),
  unlike: (postId) => api.delete(`/likes/${postId}`),
};

// Comments APIs
export const commentsAPI = {
  add: (postId, data) => api.post(`/comments/${postId}`, data),
  getComments: (postId) => api.get(`/comments/${postId}`),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

// Users APIs
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  follow: (userId) => api.post(`/users/${userId}/follow`),
  unfollow: (userId) => api.delete(`/users/${userId}/follow`),
  search: (query) => api.get('/users/search/query', { params: { query } }),
  updateProfilePicture: (profile_picture) =>
    api.patch('/users/me/profile-picture', { profile_picture }),
  getFollowers: (userId, params) => api.get(`/users/${userId}/followers`, { params }),
  getFollowing: (userId, params) => api.get(`/users/${userId}/following`, { params }),
};

export default api;
