import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  // VITAL: 必须启用此项才能在请求中包含认证 Cookie
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  }
});

// Authentication API
export const authAPI = {
  me: () => api.get('/auth/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout')
};

// Comments API
export const commentsAPI = {
  getComment: (id) => api.get(`/comments/${id}`),
  createComment: (commentData) => api.post('/comments', commentData),
  updateComment: (id, content) => api.put(`/comments/${id}`, { content }),
  deleteComment: (id) => api.delete(`/comments/${id}`)
};

// Posts API
export const postsAPI = {
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, updateData) => api.put(`/posts/${id}`, updateData),
  deletePost: (id) => api.delete(`/posts/${id}`)
};


export const communitiesAPI = {
  createCommunity: (communityData) => api.post('/communities', communityData),
  getCommunity: (id) => api.get(`/communities/${id}`),
  getCommunityByName: (name) => api.get(`/communities/name/${name}`),
  updateDescription: (id, newDescription) => api.put(`/communities/${id}/description`, { newDescription }),
};

// Users API
export const usersAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  getUserByUsername: (username) => api.get(`/users/username/${username}`),
  createUser: (userData) => api.post('/users', userData),
  updateUsername: (id, newUsername) => api.put(`/users/${id}/username`, { newUsername }),
  updatePassword: (id, passwords) => api.put(`/users/${id}/password`, passwords),
  updateEmail: (id, emailData) => api.put(`/users/${id}/email`, emailData),
  deleteUser: (id, password) => api.delete(`/users/${id}`, { data: { password } })
};

export default api;
