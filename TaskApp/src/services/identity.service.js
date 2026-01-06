import api from './api';

const identityService = {
  listIdentities: () => api.get('/identity/list'),
};

export default identityService;
