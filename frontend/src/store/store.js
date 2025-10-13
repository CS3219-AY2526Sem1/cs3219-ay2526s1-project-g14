import rootReducers from "./reducers";
import { configureStore } from '@reduxjs/toolkit'
import { thunk } from "redux-thunk"

const loadFromBrowser = () => {
    try {
        if (!localStorage.getItem("state")) {
            return undefined;
        } else {
            return JSON.parse(localStorage.getItem("state"));
        }
    } catch (err) {
        return undefined;
    }
};

const saveToBrowser = (state) => {
    try {
        localStorage.setItem("state", JSON.stringify(state));
    } catch (err) {
        console.log(err);
    }
};

const savedStore = loadFromBrowser();
export const store = configureStore({
    reducer: rootReducers,
    preloadedState: savedStore,
});

store.subscribe(() => {
    saveToBrowser(store.getState());
});


