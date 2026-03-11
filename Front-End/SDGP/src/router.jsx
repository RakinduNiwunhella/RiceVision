import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import MyDashboard from "./Components/Sites/MyDashboard";
import FieldMap from "./Components/Sites/FieldMap";
import FieldData from "./Components/Sites/FieldData";
import Alerts from "./Components/Sites/Alerts";
import Weather from "./Components/Sites/Weather";
import Report from "./Components/Sites/Report";
import Profile from "./Components/Profile/Profile";
import Help from "./Components/Sites/Help";
import Signin from "./Components/Authentication/Signin";
import Signup from "./Components/Authentication/Signup";
import ForgotPassword from "./Components/Authentication/ForgotPassword";
import ResetPassword from "./Components/Authentication/ResetPassword";
import FieldSetupPage from "./Components/FieldSetup/FieldSetupPage";

const router = createBrowserRouter([
  {
    // 1. Redirect the empty root "/" to "/signin"
    path: "/",
    element: <Navigate to="/signin" replace />,
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/field-setup",
    element: <FieldSetupPage />,
  },
  {
    // 2. Dashboard Layout starts here (No "/app" prefix)
    path: "/",
    element: <App />,
    children: [
      { path: "dashboard", element: <MyDashboard /> },
      { path: "field-map", element: <FieldMap /> },
      { path: "field-data", element: <FieldData /> },
      { path: "alerts", element: <Alerts /> },
      { path: "weather", element: <Weather /> },
      { path: "report", element: <Report /> },
      { path: "profile", element: <Profile /> },
      { path: "help", element: <Help /> },
    ],
  },
]);

export default router;
