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

export const axiosInstance = axios.create({
    timeout: _config[env].timeout,
    headers: {},
    baseURL: _config[env].baseURL,
});