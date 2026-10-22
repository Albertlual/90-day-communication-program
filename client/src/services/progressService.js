import api from './api';

export const progressService = {
  getSummary: () => api.get('/api/progress'),
  getDayProgress: (dayNumber) => api.get(`/api/progress/day/${dayNumber}`),
  saveStage: (payload) => api.post('/api/progress/stage', payload),
  completeDay: (payload) => api.post('/api/progress/complete-day', payload),
};

export default progressService;
