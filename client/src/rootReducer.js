import { combineReducers } from "redux";
import projectGroups from "./components/ProjectGroups/reducer";
import News from "./components/News/reducer";
import Feed from "./components/Feed/reducer";
import Laws from "./components/Laws/reducer";
import UserProfilePreferences from "./components/UserProfile/reducer";
import Chat from "./components/Chat/reducer";
import Login from "./components/LoginForm/reducer";

export default combineReducers({
  projectGroups,
  News,
  Feed,
  Laws,
  UserProfilePreferences,
  Chat,
  Login
});
