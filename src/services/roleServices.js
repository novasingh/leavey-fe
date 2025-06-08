import api from './axios';

const API_URL = '/roles/';

export const getRoles = async () => {
    const res = await api.get(API_URL);
    return res.data;
};