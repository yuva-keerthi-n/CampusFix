import api from './api';

export const list = (params = {}) => api.get('/complaints', { params }).then((r) => r.data.data);
export const get = (id) => api.get(`/complaints/${id}`).then((r) => r.data.data);
export const create = (formData) => api.post('/complaints', formData).then((r) => r.data.data);
export const update = (id, body) => api.put(`/complaints/${id}`, body).then((r) => r.data.data);
export const remove = (id) => api.delete(`/complaints/${id}`).then((r) => r.data);
export const updateStatus = (id, status, note) =>
  api.put(`/complaints/${id}/status`, { status, note }).then((r) => r.data.data);
export const assign = (id, staffId) =>
  api.put(`/complaints/${id}/assign`, { staffId }).then((r) => r.data.data);
export const resolve = (id, formData) =>
  api.post(`/complaints/${id}/resolve`, formData).then((r) => r.data.data);
