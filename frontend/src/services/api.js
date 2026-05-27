import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (window.location.hostname === 'localhost') return 'http://localhost:5000/api';
  return '/api';
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// Attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Users
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  getJockeys: () => API.get('/users/jockeys'),
  getLeaderboard: () => API.get('/users/leaderboard'),
  getStats: () => API.get('/users/stats'),
};

// Horses
export const horseAPI = {
  getAll: (params) => API.get('/horses', { params }),
  getById: (id) => API.get(`/horses/${id}`),
  create: (data) => API.post('/horses', data),
  update: (id, data) => API.put(`/horses/${id}`, data),
  delete: (id) => API.delete(`/horses/${id}`),
};

// Tournaments
export const tournamentAPI = {
  getAll: () => API.get('/tournaments'),
  getById: (id) => API.get(`/tournaments/${id}`),
  create: (data) => API.post('/tournaments', data),
  update: (id, data) => API.put(`/tournaments/${id}`, data),
  delete: (id) => API.delete(`/tournaments/${id}`),
};

// Races
export const raceAPI = {
  getAll: (params) => API.get('/races', { params }),
  getById: (id) => API.get(`/races/${id}`),
  create: (data) => API.post('/races', data),
  update: (id, data) => API.put(`/races/${id}`, data),
  delete: (id) => API.delete(`/races/${id}`),
  start: (id) => API.post(`/races/${id}/start`),
};

// Results
export const resultAPI = {
  getAll: () => API.get('/results'),
  getByRace: (raceId) => API.get(`/results/race/${raceId}`),
  create: (data) => API.post('/results', data),
};

// Bets
export const betAPI = {
  getMy: () => API.get('/bets'),
  create: (data) => API.post('/bets', data),
};

// Notifications
export const notificationAPI = {
  getMy: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

// Invitations
export const invitationAPI = {
  getAll: () => API.get('/invitations'),
  create: (data) => API.post('/invitations', data),
  respond: (id, response) => API.put(`/invitations/${id}/respond`, { response }),
  confirm: (id) => API.put(`/invitations/${id}/confirm`),
};
