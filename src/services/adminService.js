import api from './api';

const adminService = {
  getUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/admin/users${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  updateUserRole: async (id, role_id) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role_id });
    return response.data;
  },
    deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`, { id});
    return response.data;
  },
deleteRule: async (id) => {
  const response = await api.delete(`/admin/rules/${id}`);
  return response.data;
},
  getRules: async () => {
    const response = await api.get('/admin/rules');
    return response.data;
  },

  createRule: async (ruleData) => {
    const response = await api.post('/admin/rules', ruleData);
    return response.data;
  },

  updateRule: async (id, ruleData) => {
    const response = await api.put(`/admin/rules/${id}`, ruleData);
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/audit-logs${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  }
};

export default adminService;