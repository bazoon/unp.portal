import { combineReducers } from "redux";
import projectGroups from "./components/ProjectGroups/reducer";
import News from "./components/News/reducer";
import Feed from "./components/Feed/reducer";
import Laws from "./components/Laws/reducer";

export default combineReducers({
  projectGroups,
  News,
  Feed,
  Laws
});
