import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          richColors
          theme="dark"
          position="top-right"
          toastOptions={{
            className: "bg-slate-900/90 border border-white/10 text-slate-100",
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

