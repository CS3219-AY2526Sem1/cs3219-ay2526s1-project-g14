import {
  saveUsername
} from "../../controller/userController"

export const USERNAME = 'USERNAME';
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