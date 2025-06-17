import api from './axios';

const notificationService = {
  list: (userId) =>
    api.get('/notifications/', userId ? { params: { user_id: userId } } : undefined),
  create: (data) => api.post('/notifications/', data),
  update: (id, data) => api.put(`/notifications/${id}/`, data),
  delete: (id) => api.delete(`/notifications/${id}/`),
  notificationRead: (notification_id, user_id) =>
    api.post('/notifications/notification_read/', { notification_id, user_id }),
};

export default notificationService;
