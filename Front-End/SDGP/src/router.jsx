import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MyDashboard from "./Components/Sites/MyDashboard";
import FieldMap from "./Components/Sites/FieldMap";
import FieldData from "./Components/Sites/FieldData";
import Alerts from "./Components/Sites/Alerts";
import Weather from "./Components/Sites/Weather";
import Report from "./Components/Sites/Report";
import Profile from "./Components/Profile/Profile";
import Help from "./Components/Sites/Help";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <MyDashboard /> }, // default open page
      { path: "dashboard", element: <MyDashboard /> },
      { path: "field-map", element: <FieldMap /> },
      { path: "field-data", element: <FieldData /> },
      { path: "Alerts", element: <Alerts/> },
      { path: "Weather", element: <Weather/> },
      { path: "Report", element: <Report/> },
      { path: "Profile", element: <Profile/> }, 
      { path: "Help", element: <Help/> },

    ],
  },
]);

export default router;