import { login, register, resendOTP, verifyOTP, firebaseAuth } from "../../controller/authController";
import { getRoleById } from "../../controller/userController";

export const LOGIN = "LOGIN";
export const REGISTER = "REGISTER";
export const LOGOUT = "LOGOUT";
export const SET_OTP_EMAIL = "SET_OTP_EMAIL";
export const CLEAR_OTP_EMAIL = "CLEAR_OTP_EMAIL";
export const CLEAR_ERROR = "CLEAR_ERROR";
export const SET_USER_INFO = "SET_USER_INFO";


export const handleUserAuthenticated = (data) => async (dispatch) => {
    localStorage.setItem("token", data.token); // persist token
    dispatch({
        type: SET_USER_INFO,
        username: data.user.username,
        id: data.user.id || data.user._id,
        email: data.user.email,
        token: data.token
    });
    return { success: true };
};

export const handleLogin = (email, password) => async (dispatch) => {
    const result = await login(email, password);
    if (!result.success) return { success: false, error: result.error };
    if (result.success) return dispatch(handleUserAuthenticated(result.data))
};

export const handleRegister = (username, email, password) => async (dispatch, getState) => {
    const { otpEmail } = getState().auth;
    if (otpEmail) return { success: false, error: "Please verify OTP for previous registration first" };

    const result = await register(username, email, password);
    if (result.success) {
        dispatch({ type: SET_OTP_EMAIL, email });
    } else {
      return result;
    }
};

export const handleVerifyOTP = (email, otp) => async (dispatch) => {
    const result = await verifyOTP(email, otp);
    if (!result.success) return { success: false, error: result.error };
    dispatch({ type: CLEAR_OTP_EMAIL });
    if (result.success) return dispatch(handleUserAuthenticated(result.data))
};

export const handleResendOTP = (email) => async (dispatch) => {
    const result = await resendOTP(email);
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
};

export const handleFirebaseAuth = (firebaseUid, email, username) => async (dispatch) => {
    const result = await firebaseAuth(firebaseUid, email, username);
    if (!result.success) {
        return { success: false, error: result.error };
    } else {
        return dispatch(handleUserAuthenticated(result.data))
    }
};

export const handleLogout = () => (dispatch) => {
    dispatch({ type: LOGOUT });
};
