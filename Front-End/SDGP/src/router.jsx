import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
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
import { supabase } from "./supabaseClient";

const isValidLocalToken = (token) => {
  if (!token) return false;

  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return false;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    if (typeof payload.exp === "number") {
      return payload.exp * 1000 > Date.now();
    }

    // Tokens without exp are treated as invalid for safety.
    return false;
  } catch {
    return false;
  }
};

const requireAuthLoader = async () => {
  const localToken = localStorage.getItem("access_token");

  if (isValidLocalToken(localToken)) {
    return null;
  }

  if (localToken) {
    localStorage.removeItem("access_token");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return null;
  }

  throw redirect("/signin");
};

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
    loader: requireAuthLoader,
    element: <FieldSetupPage />,
  },
  {
    // 2. Dashboard Layout starts here (No "/app" prefix)
    path: "/",
    loader: requireAuthLoader,
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
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/signin" replace />,
  },
], {
  future: {
    v7_startTransition: true,
  },
});

export default router;
