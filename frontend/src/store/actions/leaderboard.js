import { getQuickLeaderboard, getLeaderboard } from "../../controller/leaderboardController";

export const SET_QUICK_LEADERBOARD = "SET_QUICK_LEADERBOARD";
export const SET_LEADERBOARD = "SET_LEADERBOARD";

export const fetchQuickLeaderboard = () => async (dispatch) => {
  const data = await getQuickLeaderboard();
  dispatch({ type: SET_QUICK_LEADERBOARD, payload: data });
};

export const fetchLeaderboard = (type) => async (dispatch) => {
  const data = await getLeaderboard(type);
  dispatch({ type: SET_LEADERBOARD, payload: { type, data } });
};
