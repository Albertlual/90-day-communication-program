import api from './api';

export const programService = {
  getDay: (dayNumber) => api.get(`/api/program/day/${dayNumber}`),
};

export default programService;
