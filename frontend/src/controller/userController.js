import { API } from '../constants/api'
import axiosInstance from "../config/axios"

export const saveUsername = async (username) => {
    try {
        const { status } = await axiosInstance.post(API.USER, {
            username: username,
        });
        if (status == 201) return true;
    } catch (e) {
        return false;
    }
}

export const getUserById = async (id) => {
    try {
        const { data } = await axiosInstance.get(`${API.USER}/${id}`);
        return data.payload;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
    }
};