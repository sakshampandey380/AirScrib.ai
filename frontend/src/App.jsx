import { Route, Routes } from "react-router-dom";

import AnimatedBackground from "./components/AnimatedBackground";
import AppFooter from "./components/AppFooter";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Studio from "./pages/Studio";

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink/85 bg-hero-radial text-slate-100">
      <AnimatedBackground />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <Studio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>

      <AppFooter />
    </div>
  );
}

export default App;
