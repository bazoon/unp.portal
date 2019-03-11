import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import { CreateJumpstateMiddleware } from "jumpstate";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";

import rootReducer from "./rootReducer";

const composeEnhancers = composeWithDevTools({});
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(CreateJumpstateMiddleware()))
);

export default store;
