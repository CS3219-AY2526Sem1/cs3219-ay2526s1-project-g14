import { SET_QUICK_LEADERBOARD, SET_LEADERBOARD } from "../actions/leaderboard";

const initialState = {
  quick: [],
  overall: [],
  speed: [],
  streak: [],
};

const leaderboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_QUICK_LEADERBOARD:
      return { ...state, quick: action.payload };
    case SET_LEADERBOARD:
      return { ...state, [action.payload.type]: action.payload.data };
    default:
      return state;
  }
};

export default leaderboardReducer;