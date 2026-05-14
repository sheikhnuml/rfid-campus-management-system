import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

// Components import
import AdminDashboardHome from "./AdminDashboardHome";
import AdminAttendance from "./AdminAttendance";
import AdminFinance from "./AdminFinance";
import AdminLibrary from "./AdminLibrary";
import AdminTransport from "./AdminTransport";
import AdminTimetable from "./AdminTimetable"; 
import AdminGateMonitor from "./AdminGateMonitor"; 

// 🟢 NEW: Admin News Component Import
import AdminNews from "./AdminNews"; 
import AdminProfile from "./AdminProfile";

export default function AdminLayout() {
  const role = localStorage.getItem("role");
  
  if (role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="layout" style={{ display: "flex", minHeight: "100vh", background: "#f4f7fe" }}>
      <Sidebar />
      
      <div className="main-area" style={{ flex: 1, padding: "0 20px" }}>
        <Navbar title="Admin Management System" />
        
        <div style={{ padding: "10px", animation: "fadeIn 0.5s ease" }}>
          <Routes>
            <Route index element={<AdminDashboardHome />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="library" element={<AdminLibrary />} />
            <Route path="transport" element={<AdminTransport />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="gate-monitor" element={<AdminGateMonitor />} />
            
            {/* 🟢 NEW: Admin News Route added here */}
            <Route path="news" element={<AdminNews />} />
            <Route path="profile" element={<AdminProfile />} />
          </Routes>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}