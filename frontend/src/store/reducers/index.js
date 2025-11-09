import { combineReducers } from "redux";
import user from './user';
import auth from './auth';
import leaderboard from './leaderboard';

const rootReducers = combineReducers({
    user,
    leaderboard,
    auth
});

export default rootReducers;