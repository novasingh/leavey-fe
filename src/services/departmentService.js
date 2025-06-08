import api from './axios';

const API_URL = '/departments/';

export const getDepartments = async () => {
    const res = await api.get(API_URL);
    return res.data;
};

export const addDepartment = async (data) => {
    const res = await api.post(API_URL, data);
    return res.data;
};

export const updateDepartment = async (id, data) => {
    const res = await api.put(`${API_URL}${id}/`, data);
    return res.data;
};


export const deleteDepartment = async (id) => {
    const res = await api.delete(`${API_URL}${id}/`);
    return res.data;
};

export const getManagers = async () => {
    const res = await api.get('/managers/');
    return res.data;
};




