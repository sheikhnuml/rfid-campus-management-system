import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import Navbar from "../../components/Navbar";
import StudentDashboard from "./StudentDashboard";
import StudentAttendance from "./StudentAttendance";
import StudentLibrary from "./StudentLibrary";
import StudentWallet from "./StudentWallet";
import Profile from "./Profile";
import StudentTimetable from "./StudentTimetable";
import StudentTransport from "./StudentTransport";

export default function StudentLayout() {
  // 1. Role check remains for security
  const role = localStorage.getItem("role");
  
  if (role !== "student") return <Navigate to="/login" replace />;

  return (
    <div className="layout">
      {/* 2. Using the Student-specific Sidebar */}
      <StudentSidebar />
      
      <div className="main-area">
        <Navbar title="Student Portal" />
        
        <Routes>
          {/* 3. Routes load instantly without waiting for API refreshes */}
          <Route index element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="library" element={<StudentLibrary />} />
          <Route path="wallet" element={<StudentWallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="transport" element={<StudentTransport />} />
        </Routes>
      </div>
    </div>
  );
}