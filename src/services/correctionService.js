import api from './api';

const correctionService = {
  createRequest: async (data) => {
    const response = await api.post('/corrections', data);
    return response.data;
  },

  getMyRequests: async (status = null) => {
    const url = status ? `/corrections?status=${status}` : '/corrections';
    const response = await api.get(url);
    return response.data;
  },

  getRequestStatus: async (id) => {
    const response = await api.get(`/corrections/${id}`);
    return response.data;
  }
};

export default correctionService;