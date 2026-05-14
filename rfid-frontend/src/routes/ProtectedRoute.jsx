import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  // 🟢 Check karein ke user logged in hai ya nahi
  const user = localStorage.getItem("user");
  const userRole = localStorage.getItem("role");

  // STUDENT IS NOT VALID THEN SEND USER TO SIGNOUT SCREEN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role based access logic (Old logic preserved)
  if (role && userRole !== role) {
    // Agar galat role wala banda hai toh Home par phenk do
    return <Navigate to="/" replace />;
  }

  return children;
}