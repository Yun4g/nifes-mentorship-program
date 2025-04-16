import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://leapon.onrender.com'; // Removed trailing `/api`

// Ensure WebSocket URL is correct
export const WS_URL = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only clear storage and redirect if we get a specific error message
      // indicating the token is invalid or expired
      if (error.response?.data?.message?.toLowerCase().includes('token') && 
          (error.response?.data?.message?.toLowerCase().includes('invalid') || 
           error.response?.data?.message?.toLowerCase().includes('expired'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // Only redirect to login if we're not already on the login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          // Use history.pushState instead of window.location.href
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    }

    return Promise.reject(error);
  }
);

// API methods for user accounts
export const userApi = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (data) => api.post('/users/register', data),
  getMentors: () => api.get('/users/mentors'),
  getMentees: () => api.get('/users/mentees'),
  getProfile: () => api.get('/users/profile'), // Updated route
  getCurrentUser: () => api.get('/users/profile'), // Updated route
  updateProfile: (data) => api.put('/users/profile', data), // Corrected endpoint
  updatePassword: (data) => api.put('/users/password', data),
  completeProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/users/complete-profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to complete profile'
      };
    }
  },
  uploadProfilePicture: (formData) => {
    // Override the default Content-Type for file upload
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/users/profile-picture', formData, config);
  },
  logout: () => api.post('/auth/logout'),
  sendVerificationEmail: (email) => api.post('/users/resend-verification', { email }),
  verifyEmail: (token) => api.get(`/users/verify-email/${token}`),
  checkVerificationStatus: () => api.get('/users/me'),
  initializePayment: (paymentData) => api.post('/payments/initialize', paymentData),
  verifyPayment: (reference) => api.post('/payments/verify', { reference }),
  getPaymentHistory: () => api.get('/payments/history'),
  updateRole: (data) => api.put('/users/update-role', data), // Token is automatically added via interceptors
  updateProfileStep2: (data) => api.put('/users/update-step-2', data), // Add this method
  updateProfileStep3: (data) => api.put('/users/update-step-3', data), // Add this method
  updateProfileStep4: (data) => api.put('/users/update-step-4', data), // Add this method
  applyCoupon: (couponCode) => api.post('/payments/apply-coupon', { couponCode }),
  getAllUsers: () => api.get('/users'), // Add this method to fetch all users
};

// API methods for sessions
export const sessionApi = {
  getAll: () => api.get('/sessions'),
  getPending: () => api.get('/sessions/pending'),
  getAccepted: () => api.get('/sessions/accepted'),
  getHistory: () => api.get('/sessions/history'),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  updateStatus: (id, status) => api.put(`/sessions/${id}/status`, { status }),
  addFeedback: (id, feedback) => api.post(`/sessions/${id}/feedback`, feedback),
  update: (id, data) => api.put(`/sessions/${id}/status`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
  join: (id) => api.post(`/sessions/${id}/join`),
  leave: (id) => api.post(`/sessions/${id}/leave`),
  getUpcoming: () => api.get('/sessions/upcoming')
};

// API methods for messages
export const messageApi = {
  getAll: () => api.get('/messages'),
  getByUserId: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get('/messages/unread/count')
};

// API methods for conversations
export const conversationApi = {
  getAll: () => api.get('/conversations'),
  getById: (id) => api.get(`/conversations/${id}`),
  create: (data) => api.post('/conversations', data),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
  sendMessage: (id, data) => api.post(`/conversations/${id}/messages`, data),
  markAsRead: (id) => api.put(`/conversations/${id}/read`)
};

// API methods for resources
export const resourceApi = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  download: (id) => api.get(`/resources/${id}/download`)
};

// API methods for progress
export const progressApi = {
  getProgress: () => api.get('/progress'),
  updateProgress: (data) => api.put('/progress', data),
  getAchievements: () => api.get('/progress/achievements'),
  getGoals: () => api.get('/progress/goals')
};

export default api;
