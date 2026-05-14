import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const role = localStorage.getItem("role") || "guest";
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const location = useLocation();

  // 🟢 Problem Fix: Dynamic path for Profile based on Role
  const getProfilePath = () => {
    if (role === "admin") return "/admin/profile";
    if (role === "cafe") return "/cafe/profile";
    if (role === "library") return "/library/profile";
    if (role === "student") return "/student/profile";
    return "/login";
  };

  const currentProfilePath = getProfilePath();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar" style={{ 
      width: "260px", background: "#ffffff", height: "100vh", 
      borderRight: "1px solid #f1f5f9", display: "flex", 
      flexDirection: "column", position: "sticky", top: 0, zIndex: 100
    }}>
      {/* 1. Logo Section (Same as Old) */}
      <div style={{ padding: "30px 25px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "35px", height: "35px", background: "#4f46e5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>RFID</div>
        <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>BASED CARD SYSTEM</span>
      </div>

      {/* 2. Navigation Links */}
      <ul style={{ listStyle: "none", padding: "0 15px", flex: 1, overflowY: "auto" }}>
        
        {/* 👤 DYNAMIC PROFILE LINK (Problem Fixed Here) */}
        <li style={liStyle(isActive(currentProfilePath))}>
          <Link to={currentProfilePath} style={linkStyle(isActive(currentProfilePath))}>
            <span>👤</span> Profile
          </Link>
        </li>

        {/* <div style={{ height: "1px", background: "#f1f5f9", margin: "15px 10px" }}></div> */}

        {/* --- ADMIN LINKS (Same as Old) --- */}
        {role === "admin" && (
          <>
            <li style={liStyle(isActive("/admin"))}><Link to="/admin" style={linkStyle(isActive("/admin"))}><span>🏠</span> Dashboard</Link></li>
            <li style={liStyle(isActive("/admin/attendance"))}><Link to="/admin/attendance" style={linkStyle(isActive("/admin/attendance"))}><span>📊</span> Attendance</Link></li>
            <li style={liStyle(isActive("/admin/finance"))}><Link to="/admin/finance" style={linkStyle(isActive("/admin/finance"))}><span>💳</span> Finance</Link></li>
            <li style={liStyle(isActive("/admin/library"))}><Link to="/admin/library" style={linkStyle(isActive("/admin/library"))}><span>📚</span> Library</Link></li>
            <li style={liStyle(isActive("/admin/transport"))}><Link to="/admin/transport" style={linkStyle(isActive("/admin/transport"))}><span>🚌</span> Transport</Link></li>
            <li style={liStyle(isActive("/admin/timetable"))}><Link to="/admin/timetable" style={linkStyle(isActive("/admin/timetable"))}><span>⌛</span> Timetable</Link></li>
            <li style={liStyle(isActive("/admin/gate-monitor"))}><Link to="/admin/gate-monitor" style={linkStyle(isActive("/admin/gate-monitor"))}><span>🛡️</span> Gate Monitoring</Link></li>
            <li style={liStyle(isActive("/admin/news"))}><Link to="/admin/news" style={linkStyle(isActive("/admin/news"))}><span>📢</span> News Management</Link></li>
          </>
        )}

        {/* --- CAFE MANAGER LINKS (Same as Old) --- */}
        {role === "cafe" && (
          <>
            <li style={liStyle(isActive("/cafe"))}><Link to="/cafe" style={linkStyle(isActive("/cafe"))}><span>☕</span> Cafe Dashboard</Link></li>
          </>
        )}

        {/* --- LIBRARY MANAGER LINKS (Same as Old) --- */}
        {role === "library" && (
          <>
            <li style={liStyle(isActive("/library"))}><Link to="/library" style={linkStyle(isActive("/library"))}><span>📚</span> Library Books</Link></li>
          </>
        )}

        {/* --- STUDENT LINKS (Same as Old) --- */}
        {role === "student" && (
          <>
            <li style={liStyle(isActive("/student"))}><Link to="/student" style={linkStyle(isActive("/student"))}><span>🎓</span> My Portal</Link></li>
            <li style={liStyle(isActive("/student/attendance"))}><Link to="/student/attendance" style={linkStyle(isActive("/student/attendance"))}><span>📅</span> My Attendance</Link></li>
            <li style={liStyle(isActive("/student/wallet"))}><Link to="/student/wallet" style={linkStyle(isActive("/student/wallet"))}><span>👛</span> My Wallet</Link></li>
            <li style={liStyle(isActive("/student/timetable"))}><Link to="/student/timetable" style={linkStyle(isActive("/student/timetable"))}><span>⏳</span> My Timetable</Link></li>
          </>
        )}
      </ul>

      {/* 3. Bottom User Info Section  */}
      <div style={{ padding: "20px", borderTop: "1px solid #f1f5f9", background: "#fcfdff", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
          <div style={{ 
            width: "40px", height: "40px", background: "#eef2ff", borderRadius: "12px", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            color: "#4f46e5", fontWeight: "bold", border: "1px solid #e0e7ff" 
          }}>
            {user ? user.name[0].toUpperCase() : "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "13px", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {user ? user.name : "User"}
            </div>
            <div style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: "600" }}>
              {role}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => { 
            localStorage.clear(); // Saara data clear kiya
            window.location.href = "/login";
          }}
          style={{ 
            width: "100%", 
            padding: "12px", 
            borderRadius: "10px", 
            border: "1px solid #fee2e2", 
            background: "#fff5f5", 
            color: "#ef4444", 
            fontWeight: "700", 
            fontSize: "13px", 
            cursor: "pointer" 
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

const liStyle = (active) => ({ marginBottom: "4px", borderRadius: "10px", background: active ? "#f0f2ff" : "transparent" });
const linkStyle = (active) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", textDecoration: "none", color: active ? "#4f46e5" : "#64748b", fontWeight: active ? "700" : "500", fontSize: "14px" });