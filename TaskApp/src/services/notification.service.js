import api from './api';

const notificationService = {
  listNotifications: () => api.get('/notifications'),
};

export default notificationService;
