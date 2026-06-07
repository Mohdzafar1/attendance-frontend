import api from './api';

const attendanceService = {
  clockIn: async (location) => {
    const response = await api.post('/attendance/clock-in', { location });
    return response.data;
  },

  clockOut: async (location) => {
    const response = await api.post('/attendance/clock-out', { location });
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getHistory: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/attendance/history${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  }
};

export default attendanceService;