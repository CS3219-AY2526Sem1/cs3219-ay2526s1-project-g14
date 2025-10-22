import { API } from '../constants/api'
import axiosInstance from "../config/axios"

export const getQuickLeaderboard = async () => {
    try {
        const { data } = await axiosInstance.get(API.LEADERBOARD_HOME);
        return data.result;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        throw error;
    }
};

export const getLeaderboard = async (type = "overall") => {
    try {
        const { data } = await axiosInstance.get(API.LEADERBOARD(type));
        return data.result;
    } catch (error) {
        console.error(`Error fetching leaderboard [${type}]:`, error);
        throw error;
    }
};