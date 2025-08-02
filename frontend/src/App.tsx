import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TimelinePage from "./pages/TimelinePage";
import SelectDatesPage from "./pages/SelectDatesPage";

function App() {
  // Initialize state from localStorage
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem("accessToken")
  );
  const location = useLocation();

  // Update localStorage when token changes
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);

  // Clear any existing state when logging out
  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          !accessToken ? (
            <LoginPage setAccessToken={setAccessToken} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/select-dates"
        element={
          accessToken ? (
            <SelectDatesPage />
          ) : (
            <Navigate to="/" replace state={{ from: location }} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          accessToken ? (
            <DashboardPage
              accessToken={accessToken}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/" replace state={{ from: location }} />
          )
        }
      />
      <Route
        path="/timeline/:jobId"
        element={
          accessToken ? (
            <TimelinePage />
          ) : (
            <Navigate to="/" replace state={{ from: location }} />
          )
        }
      />
      {/* Catch all unknown routes and redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
