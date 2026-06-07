import api from './api';

const hrService = {
  getPendingRequests: async () => {
    const response = await api.get('/hr/corrections/pending');
    return response.data;
  },

  reviewRequest: async (id, status, remarks) => {
    const response = await api.put(`/hr/corrections/${id}/review`, { status, remarks });
    return response.data;
  },

  getAllAttendance: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/hr/attendance/all${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  }
};

export default hrService;