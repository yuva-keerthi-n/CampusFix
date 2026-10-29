import api from './api';

export const stats = () => api.get('/dashboard/stats').then((r) => r.data.data);
