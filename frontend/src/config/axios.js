import axios from 'axios';

const _config = {
    development: {
        baseURL: process.env.REACT_APP_USER_URL || 'http://localhost:5050',
        timeout: 60000,
    },
    production: {
        baseURL: process.env.REACT_APP_USER_URL || 'http://localhost:5050',
        timeout: 3000,
    }
}

const env = "development";

const axiosInstance = axios.create({
    timeout: _config[env].timeout,
    headers: {},
    baseURL: _config[env].baseURL,
    withCredentials: true,
});

const forceToLogin = () => {
    window.localStorage.removeItem("state");
    window.location.href = "/login"
}

const forceToLogout = () => {
    window.localStorage.removeItem("state");
    window.location.href = "/"
}

function getToken() {
    const direct = localStorage.getItem('token');
    const alt = localStorage.getItem('authToken');
    try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u?.token) return u.token;
    } catch { }
    return direct || alt || null;
}

axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    response =>
        Promise.resolve(response),
    async err => {
        const originalRequest = err.config;
        if (err?.response.status === 403) {
            forceToLogin();
        }
        if (err?.response.status === 401 && originalRequest._retry) {
            console.log("Token have expired!")
            forceToLogout();
        }
        return Promise.reject(err);
    }
);

export default axiosInstance;