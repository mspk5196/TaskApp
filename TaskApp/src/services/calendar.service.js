import api from './api';

const calendarService = {
  getSlots: (params) => api.post('/calendar/slots', params),
};

export default calendarService;
