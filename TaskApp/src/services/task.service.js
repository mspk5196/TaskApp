import api from './api';

const taskService = {
  listTasks: () => api.get('/tasks'),
  getTask: (id) => api.get(`/tasks/${id}`),
};

export default taskService;
