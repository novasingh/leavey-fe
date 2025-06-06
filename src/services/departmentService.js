import api from './axios';

const API_URL = '/departments/';

export const getDepartments = async () => {
    const token = localStorage.getItem('access_token');
    const res = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const addDepartment = async (data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateDepartment = async (id, data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.put(`${API_URL}${id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteDepartment = async (id) => {
    const token = localStorage.getItem('access_token');
    const res = await api.delete(  `${API_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};