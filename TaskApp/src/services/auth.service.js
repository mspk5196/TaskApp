import api from './api';

const authService = {
  login: (phoneNumber, password) =>
    api.login(phoneNumber, password),

  googleLogin: (email) =>
    api.g_login(email),

  logout: () => api.logout(),

  getProfile: () => api.getProfile(),
};

export default authService;
