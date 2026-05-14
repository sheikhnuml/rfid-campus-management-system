import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- 1. Auth & Landing Pages ---
import Login from "./pages/Auth/Login";
import Home from "./pages/Landing/Home";
import About from "./pages/Landing/About";
import Features from "./pages/Landing/Features";
import LearnMore from "./pages/Landing/LearnMore";

// --- 2. Dashboard Layouts ---
import AdminLayout from "./pages/Admin/AdminLayout";
import StudentLayout from "./pages/Student/StudentLayout";
import LibraryLayout from "./pages/Library/LibraryLayout";
import CafeLayout from "./pages/Cafe/CafeLayout";
import TransportLayout from "./pages/Transport/TransportLayout";
import SecurityLayout from "./pages/Security/SecurityLayout";

// --- 3. Profile Pages ---
import AdminProfile from "./pages/Admin/AdminProfile"; // Ensure this import exists
import CafeProfile from "./pages/Cafe/CafeProfile";
import LibraryProfile from "./pages/Library/LibraryProfile";

// --- 4. Terminal Components ---
import Terminal from "./pages/Terminal/Terminal"; 
import TransportTerminal from "./pages/Terminal/TransportTerminal"; 

// Dispatcher Component to decide which profile to show
const ProfileDispatcher = () => {
  const role = localStorage.getItem("role");
  if (role === "admin") return <AdminProfile />;
  if (role === "cafe") return <CafeProfile />;
  if (role === "library") return <LibraryProfile />;
  return <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      {/* 🟢 PUBLIC ROUTES */}
      <Route path="/" element={<Home />} /> 
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/login" element={<Login />} />

      {/* 🔵 ROLE-BASED DASHBOARDS */}
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/student/*" element={<StudentLayout />} />
      <Route path="/library/*" element={<LibraryLayout />} />
      <Route path="/cafe/*" element={<CafeLayout />} />
      <Route path="/transport/*" element={<TransportLayout />} />
      <Route path="/gate/*" element={<SecurityLayout />} />

      {/* 👤 UNIFIED PROFILE ROUTE (The Easy Fix) */}
      <Route path="/profile" element={<ProfileDispatcher />} />
      
      {/* 📟 TERMINAL ROUTES */}
      <Route path="/terminal" element={<Terminal />} /> 
      <Route path="/cafe/terminal" element={<Terminal />} />
      <Route path="/library/terminal" element={<Terminal />} />
      <Route path="/transport/terminal" element={<TransportTerminal />} />

      {/* ❗ ERROR HANDLING */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}