import axios from 'axios';

const _config = {
    development: {
        baseURL: "http://localhost:5050",
        timeout: 60000,
    },
    production: {
        baseURL: "http://127.0.0.1:5050",
        timeout: 3000,
    }
}

const env = "development";

const axiosInstance = axios.create({
    timeout: _config[env].timeout,
    headers: {},
    baseURL: _config[env].baseURL,
});

const forceToLogin = () => {
    window.localStorage.removeItem("state");
    window.location.href="/login"
}

const forceToLogout = () => {
    window.localStorage.removeItem("state");
    window.location.href="/"
}

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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