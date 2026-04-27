import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, RouterProvider } from "react-router-dom";
// import App from "./App";
import "./index.css";
import router from "./Routes/router";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <BrowserRouter>
      <App />
    </BrowserRouter> */}
    <RouterProvider router={router} future={{
      v7_startTransition: true,
    }}>
    </RouterProvider>
  </React.StrictMode>,
);
