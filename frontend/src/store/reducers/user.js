import {
  CLEAR,
  USERNAME,
  SET_USER_STATS,
  SET_USER_ATTEMPTS,
  USER_LOADING,
  USER_ERROR,
} from '../actions/user';

const initialState = {
  stats: null,
  attempts: [],
  loading: false,
  error: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOADING:
      return { ...state, loading: true, error: null };
    case SET_USER_STATS:
      return { ...state, stats: action.payload, loading: false };
    case SET_USER_ATTEMPTS:
      return { ...state, attempts: action.payload, loading: false };
    case USER_ERROR:
      return { ...state, loading: false, error: action.error };
    case USERNAME:
      return {
        username: action.username
      };
    case CLEAR:
      return initialState;
    default:
      return state;
  }
};

export default reducer;