import React from "react";
import { Navigate } from "react-router-dom";
import Terminal from "../Terminal/Terminal";

export default function SecurityLayout() {
  // 1. Get the role from our local login session
  const role = localStorage.getItem("role");

  // 2. Allow "security" (and optionally "admin" for testing) to access
  if (role !== "security" && role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  // 3. Renders the Terminal (the gate scanning interface)
  return <Terminal />;
}