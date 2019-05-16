import { combineReducers } from "redux";
import projectGroups from "./components/ProjectGroups/reducer";
import News from "./components/News/reducer";
import Feed from "./components/Feed/reducer";
import Laws from "./components/Laws/reducer";
import UserProfilePreferences from "./components/UserProfile/reducer";
import Chat from "./components/Chat/reducer";
import Login from "./components/LoginForm/reducer";
import ProjectGroup from "./components/Group/reducer";
import Conversation from "./components/Conversation/reducer";
import Events from "./components/Events/reducer";
import Users from "./usersReducer";

import AdminUsers from "./components/Admin/Users/reducer";

export default combineReducers({
  projectGroups,
  News,
  Feed,
  Laws,
  UserProfilePreferences,
  Chat,
  Login,
  ProjectGroup,
  Conversation,
  Events,
  Users,
  AdminUsers
});
