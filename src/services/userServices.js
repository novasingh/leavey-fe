import api from './axios';

const API_URL = '/users/';
export const getUsers = async () => {
    const res = await api.get(API_URL);
    return res.data;
};

export const addUser = async (userData) => {
    const res = await api.post(API_URL, userData);
    return res.data;
};

export const updateUser = async (userId, userData) => {
    const res = await api.put(`${API_URL}${userId}/`, userData);
    return res.data;
};

export const deleteUser = async (userId) => {
    const res = await api.delete(`${API_URL}${userId}/`);
    return res.data;
};