import { combineReducers } from "redux";
import user from './user';
import auth from './auth';

const rootReducers = combineReducers({
    user,
    auth
});

export default rootReducers;