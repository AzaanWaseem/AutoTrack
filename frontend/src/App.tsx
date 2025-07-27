// src/App.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TimelinePage from "./pages/TimelinePage";

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
        path="/dashboard"
        element={
          accessToken ? <DashboardPage /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/timeline/:jobId"
        element={
          accessToken ? <TimelinePage /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default App;
