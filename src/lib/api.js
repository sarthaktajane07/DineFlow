import axios from 'axios';
// Create a configured axios instance
const apiUrl = import.meta.env.VITE_API_URL || 'https://dineflow-backend-16lw.onrender.com/api';
console.log('Using API URL:', apiUrl);

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Request interceptor to add the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor to handle auth errors
api.interceptors.response.use((response) => response, (error) => {
    // If the error is 401 Unauthorized, log out the user
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page if not already there
        if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
        }
    }
    return Promise.reject(error);
});
export default api;
