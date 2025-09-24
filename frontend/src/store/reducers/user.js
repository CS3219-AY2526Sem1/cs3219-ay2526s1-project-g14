import {
  CLEAR,
  USERNAME
} from '../actions/user';

const initialState = {
  username: "",
  token: undefined,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
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