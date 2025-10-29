import { API } from '../constants/api'
import axios from 'axios';

// Create axios instance for the attempt microservice
const userAttemptAxios = axios.create({
    baseURL: process.env.REACT_APP_ATTEMPT_SERVICE_URL || 'http://localhost:5053',
    timeout: 10000
});

// Add auth token if needed
userAttemptAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getQuickLeaderboard = async () => {
    try {
        const { data } = await userAttemptAxios.get(API.LEADERBOARD_HOME);
        return data.result;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        throw error;
    }
};

export const getLeaderboard = async (type = "overall") => {
    try {
        const { data } = await userAttemptAxios.get(API.LEADERBOARD(type));
        return data.result;
    } catch (error) {
        console.error(`Error fetching leaderboard [${type}]:`, error);
        throw error;
    }
};