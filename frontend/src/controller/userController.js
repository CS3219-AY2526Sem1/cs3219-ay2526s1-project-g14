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

export const getRoleById = async (id) => {
    try {
        const { data } = await axiosInstance.get(`${API.USER}/${id}`);
        return data.payload.role;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
    }
};


export const updateUsername = async (username) => {
    try {
        const { data, status } = await axiosInstance.put(API.USER_UPDATE_USERNAME, { username });
        if (status === 200) return { success: true, message: data.message };
    } catch (e) {
        return { success: false, error: e.response?.data?.message || "Error updating username" };
    }
};

export const updatePassword = async (currentPassword, newPassword) => {
    try {
        const { data, status } = await axiosInstance.put(API.USER_UPDATE_PASSWORD, { currentPassword, newPassword });
        if (status === 200) return { success: true, message: data.message };
    } catch (e) {
        return { success: false, error: e.response?.data?.message || "Error updating password" };
    }
};

export const requestEmailChange = async (newEmail) => {
    try {
        const { data, status } = await axiosInstance.post(API.USER_CHANGE_EMAIL_REQUEST, { newEmail });
        if (status === 200) return { success: true, message: data.message };
    } catch (e) {
        return { success: false, error: e.response?.data?.message || "Error sending OTP" };
    }
};

export const verifyEmailChange = async (newEmail, otp) => {
    try {
        const { data, status } = await axiosInstance.post(API.USER_CHANGE_EMAIL_VERIFY, { newEmail, otp });
        if (status === 200) return { success: true, message: data.message, newEmail };
    } catch (e) {
        return { success: false, error: e.response?.data?.message || "Error verifying OTP" };
    }
};

export const deleteAccount = async () => {
    try {
        const { data, status } = await axiosInstance.delete(API.USER_DELETE);
        if (status === 200) return { success: true, message: data.message };
    } catch (e) {
        return { success: false, error: e.response?.data?.message || "Error deleting account" };
    }
};

export const fetchUserAttempts = async (userId) => {
    try {
        const { data } = await axiosInstance.get(API.USER_ATTEMPTS);
        return data.result;
    } catch (error) {
        console.error("Error fetching user attempts:", error);
        throw error;
    }
};

export const fetchUserStats = async (userId) => {
    try {
        console.log("calling");
        const { data } = await axiosInstance.get(API.USER_STATS);
        console.log(data);
        return data.result;
    } catch (error) {
        console.error("Error fetching user stats:", error);
        throw error;
    }
};