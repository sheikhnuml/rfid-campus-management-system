import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Transport from "../Admin/AdminTransport";
import Terminal from "../Terminal/Terminal";

export default function TransportLayout() {
  // 1. Role verification from local session
  const role = localStorage.getItem("role");
  
  if (role !== "transport") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout" style={{ display: "flex", minHeight: "100vh", background: "#f4f7fe" }}>
      <Sidebar />
      <div className="main-area" style={{ flex: 1, padding: "0 20px" }}>
        <Navbar title="Transport Management System" />
        
        <Routes>
          {/* Main Transport Dashboard */}
          <Route index element={<Transport />} />
          
          {/* Terminal Mode inside Transport */}
          <Route path="terminal" element={<Terminal />} />
        </Routes>
      </div>
    </div>
  );
}