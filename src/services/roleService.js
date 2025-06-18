import api from './axios';

const API_URL = '/roles/';

export const getRoles = async () => {
    const res = await api.get(API_URL);
    return res.data;
};

export const addRole = async (data) => {
  const res = await api.post(API_URL, data);
  return res.data;
};

export const updateRole = async (id, data) => {
  const res = await api.put(`${API_URL}${id}/`, data);
  return res.data;
};

export const deleteRole = async (id) => {
  const res = await api.delete(`${API_URL}${id}/`);
  return res.data;
};

export const getAllPermissions = async () => {
  const res = await api.get('/permission-all/');
  return res.data;
};