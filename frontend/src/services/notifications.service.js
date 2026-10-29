import api from './api';

export const list = () => api.get('/notifications').then((r) => r.data.data);
export const markRead = (id) => api.put(`/notifications/${id}/read`).then((r) => r.data.data);
