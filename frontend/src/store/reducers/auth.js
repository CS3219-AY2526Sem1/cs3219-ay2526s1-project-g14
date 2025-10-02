import { LOGIN, LOGOUT, SET_OTP_EMAIL, CLEAR_OTP_EMAIL, SET_USER_INFO } from "../actions/auth";

const initialState = {
  username: null,
  id: null,
  email: null,
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
