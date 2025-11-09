import axiosInstance from "../config/axios";
import { API } from "../constants/api";

export const login = async (email, password) => {
    try {
        const { data, status } = await axiosInstance.post(API.LOGIN, { email, password });
        if (status === 200) return { data, success: true };
    } catch (e) {
        const errorMessage = e.response ? e.response.data.message : "Server error";
        return { success: false, error: errorMessage };
    }
};

export const register = async (username, email, password) => {
    try {
        const { data, status } = await axiosInstance.post(API.REGISTER, {
            username,
            email,
            password,
        });
        if (status === 200)
            return { success: true };
        if (status === 400)
            return { success: false, message: data };
    } catch (e) {
        const errorMessage = e.response ? e.response.data.message : "Server error";
        return { success: false, error: errorMessage };
    }
};

export const resendOTP = async (email) => {
    try {
        const { data, status } = await axiosInstance.post(API.RESEND_OTP, { email });
        if (status === 200) return { data, success: true };
    } catch (e) {
        const errorMessage = e.response ? e.response.data.message : "Server error";
        return { success: false, error: errorMessage };
    }
};

export const verifyOTP = async (email, otp) => {
    try {
        const { data, status } = await axiosInstance.post(API.VERIFY_OTP, { email, otp });
        if (status === 201) return { data, success: true };
    } catch (e) {
        const errorMessage = e.response ? e.response.data.message : "Server error";
        return { success: false, error: errorMessage };
    }
};

export const firebaseAuth = async (firebaseUid, email, username) => {
    try {
        const { data, status } = await axiosInstance.post(API.FIREBASE_AUTH, {
            firebaseUid,
            email,
            username,
        });
        if (status === 200) return { data, success: true };
    } catch (e) {
        const errorMessage = e.response ? e.response.data.message : "Server error";
        return { success: false, error: errorMessage };
    }
};
