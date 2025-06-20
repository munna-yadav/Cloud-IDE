import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Handle API errors without automatic redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const auth = {
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/users/register', data),
  logout: () => api.post('/users/logout'),
  verifyEmail: (token: string) => 
    api.get(`/users/verify-email?token=${token}`),
  forgotPassword: (email: string) =>
    api.post('/users/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/users/reset-password/${token}`, { password }),
  getProfile: () => api.get('/users/me'),
  deleteAccount: () => api.delete('/users/delete'),
};

export const users = {
  findByEmail: (email: string) => 
    api.get(`/users/find-by-email?email=${encodeURIComponent(email)}`),
};

export const projects = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description: string }) =>
    api.post('/projects', data),
  update: (id: string, data: { name: string; description: string }) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: async (projectId: string, email: string) => {
    // First find the user by email
    const userResponse = await users.findByEmail(email);
    const userId = userResponse.data.id;
    // Then add the user to the project
    return api.post(`/projects/${projectId}/members`, { userId });
  },
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members`, { data: { userId } }),
};

export const files = {
  list: (projectId: string) => api.get(`/projects/${projectId}/files`),
  get: (_projectId: string, fileId: string) =>
    api.get(`/files/${fileId}`),
  create: (projectId: string, data: { name: string; content: string; language: string; path: string }) =>
    api.post('/files', { ...data, projectId }),
  update: (fileId: string, data: { content: string }) =>
    api.put(`/files/${fileId}`, data),
  delete: (fileId: string) =>
    api.delete(`/files/${fileId}`),
};

export const codeExecution = {
  execute: (data: { code: string; language?: string; input?: string }) =>
    api.post('/execute', data),
};

export default api;