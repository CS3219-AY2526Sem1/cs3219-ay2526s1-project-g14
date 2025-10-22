import { LOGIN, LOGOUT, SET_OTP_EMAIL, CLEAR_OTP_EMAIL, SET_USER_INFO } from "../actions/auth";
import { UPDATE_USERNAME, UPDATE_EMAIL, DELETE_USER } from "../actions/user";

const initialState = {
  username: null,
  id: null,
  email: null,
  role: null,
  token: null,
  otpEmail: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO: {
      return {
        ...state,
        username: action.username,
        id: action.id,
        email: action.email,
        role: action.role,
        token: action.token
      };
    }

    case SET_OTP_EMAIL: {
      return {
        ...state,
        otpEmail: action.email
      };
    }

    case CLEAR_OTP_EMAIL: {
      return {
        ...state,
        otpEmail: null
      };
    }

    case UPDATE_USERNAME:
      return { ...state, username: action.payload.username };

    case UPDATE_EMAIL:
      return { ...state, email: action.payload.email };

    case DELETE_USER:

    case LOGOUT: {
      return {
        ...initialState
      };
    }

    default: {
      return state;
    }
  }
};

export default authReducer;
