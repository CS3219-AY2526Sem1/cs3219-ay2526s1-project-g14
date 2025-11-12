import {
  saveUsername,
  updateUsername,
  updatePassword,
  deleteAccount,
  requestEmailChange,
  verifyEmailChange,
  fetchUserStats,
  fetchUserAttempts
} from "../../controller/userController"

export const USERNAME = 'USERNAME';
export const UPDATE_USERNAME = "UPDATE_USERNAME";
export const UPDATE_EMAIL = "UPDATE_EMAIL";
export const DELETE_USER = "DELETE_USER";
export const SET_USER_STATS = "SET_USER_STATS";
export const SET_USER_ATTEMPTS = "SET_USER_ATTEMPTS";
export const USER_LOADING = "USER_LOADING";
export const USER_ERROR = "USER_ERROR";
export const CLEAR = 'CLEAR';

export const handleSaveUsername = (username) => async (dispatch) => {
  const result = await saveUsername(username);
  if (!result) return false;
  dispatch({
    type: USERNAME,
    username: username,
  });
  return true
};

export const handleUpdateUsername = (username) => async (dispatch) => {
  const result = await updateUsername(username);
  if (!result.success) return result;
  dispatch({ type: UPDATE_USERNAME, payload: { username: username } });
  return result;
};

export const handleUpdatePassword = (currentPassword, newPassword) => async () => {
  const result = await updatePassword(currentPassword, newPassword);
  return result;
};

export const handleRequestEmailChange = (newEmail) => async () => {
  const result = await requestEmailChange(newEmail);
  return result;
};

export const handleVerifyEmailChange = (newEmail, otp) => async (dispatch) => {
  const result = await verifyEmailChange(newEmail, otp);
  if (!result.success) return result;
  dispatch({ type: UPDATE_EMAIL, payload: { email: result.newEmail } });
  return result;
};

export const handleDeleteUser = () => async (dispatch) => {
  const result = await deleteAccount();
  if (result.success) dispatch({ type: DELETE_USER });
  return result;
};

export const handleFetchUserStats = () => async (dispatch) => {
  try {
    dispatch({ type: USER_LOADING });
    const data = await fetchUserStats();
    dispatch({ type: SET_USER_STATS, payload: data });
    return { success: true, data };
  } catch (error) {
    dispatch({ type: USER_ERROR, error: "Failed to fetch user stats" });
    return { success: false, error: error.message };
  }
};

export const handleFetchUserAttempts = () => async (dispatch) => {
  try {
    dispatch({ type: USER_LOADING });
    const data = await fetchUserAttempts();
    dispatch({ type: SET_USER_ATTEMPTS, payload: data });
    return { success: true, data };
  } catch (error) {
    dispatch({ type: USER_ERROR, error: "Failed to fetch user attempts" });
    return { success: false, error: error.message };
  }
};