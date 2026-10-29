import api from './api';

// Categories and locations share the same shape, so one factory builds both.
const crud = (path) => ({
  list: () => api.get(path).then((r) => r.data.data),
  create: (name) => api.post(path, { name }).then((r) => r.data.data),
  update: (id, name) => api.put(`${path}/${id}`, { name }).then((r) => r.data.data),
  remove: (id) => api.delete(`${path}/${id}`).then((r) => r.data),
});

export const categories = crud('/categories');
export const locations = crud('/locations');

export const users = {
  list: (role) => api.get('/users', { params: role ? { role } : {} }).then((r) => r.data.data),
};
