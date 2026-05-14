import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Library from "../Admin/AdminLibrary";
import LibraryProfile from "./LibraryProfile";

export default function LibraryLayout() {
  const role = localStorage.getItem("role");

  if (role !== "library" && role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="main-area" style={{ flex: 1 }}>
        <Navbar title="Library Manager" />
        
        <div style={{ padding: "10px" }}>
          <Routes>
            <Route index element={<Library />} />
            <Route path="profile" element={<LibraryProfile />} /> {}
          </Routes>
        </div>
      </div>
    </div>
  );
}