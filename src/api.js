import axios from 'axios';

const API_URL = 'https://api.mail.tm';

const api = axios.create({
    baseURL: API_URL,
});

export const getDomains = async () => {
    const response = await api.get('/domains');
    return response.data['hydra:member'];
};

export const createAccount = async (address, password) => {
    const response = await api.post('/accounts', { address, password });
    return response.data;
};

export const getToken = async (address, password) => {
    const response = await api.post('/token', { address, password });
    return response.data.token;
};

export const getMessages = async (token) => {
    const response = await api.get('/messages', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data['hydra:member'];
};

export const getMessage = async (token, id) => {
    const response = await api.get(`/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const deleteMessage = async (token, id) => {
    await api.delete(`/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const sendMessage = async (token, fromAddress, to, subject, body) => {
    // mail.tm / Hydra format for sending
    const data = {
        address: fromAddress, // "from" field in some implementations, or cleaner:
        from: { address: fromAddress, name: "Temp Mail User" },
        to: [{ address: to, name: "" }],
        subject: subject,
        html: body,
        text: body // best practice to include both
    };

    const response = await api.post('/messages', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
