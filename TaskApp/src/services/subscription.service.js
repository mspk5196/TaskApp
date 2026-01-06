import api from './api';

const subscriptionService = {
  listSubscriptions: () => api.get('/subscriptions'),
};

export default subscriptionService;
