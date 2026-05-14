import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function StudentSidebar() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const location = useLocation();

  const isActive = (path) => location.pathname === path || (path !== "/student" && location.pathname.startsWith(path));

  return (
    <aside className="sidebar" style={sidebarContainerStyle}>
      
      {/* 1. Logo Section - Soft Professional Look */}
      <div style={{ padding: "30px 25px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={logoIconStyle}>RFID</div>
        <span style={logoTextStyle}>BASED CARD SYSTEM</span>
      </div>

      {/* 2. Navigation Links */}
      <ul style={{ listStyle: "none", padding: "0 15px", flex: 1, overflowY: "auto" }}>
        <li style={liStyle(isActive("/student"))}>
          <Link to="/student" style={linkStyle(isActive("/student"))}>
            <span style={{opacity: isActive("/student") ? 1 : 0.7}}>🎓</span> My Portal
          </Link>
        </li>
        <li style={liStyle(isActive("/student/attendance"))}>
          <Link to="/student/attendance" style={linkStyle(isActive("/student/attendance"))}>
            <span style={{opacity: isActive("/student/attendance") ? 1 : 0.7}}>📊</span> Attendance
          </Link>
        </li>
        <li style={liStyle(isActive("/student/timetable"))}>
          <Link to="/student/timetable" style={linkStyle(isActive("/student/timetable"))}>
            <span style={{opacity: isActive("/student/timetable") ? 1 : 0.7}}>⏳</span> Timetable
          </Link>
        </li>
        <li style={liStyle(isActive("/student/library"))}>
          <Link to="/student/library" style={linkStyle(isActive("/student/library"))}>
            <span style={{opacity: isActive("/student/library") ? 1 : 0.7}}>📚</span> Library
          </Link>
        </li>
        <li style={liStyle(isActive("/student/wallet"))}>
          <Link to="/student/wallet" style={linkStyle(isActive("/student/wallet"))}>
            <span style={{opacity: isActive("/student/wallet") ? 1 : 0.7}}>👛</span> My Wallet
          </Link>
        </li>
        
        
        <li style={liStyle(isActive("/student/transport"))}>
          <Link to="/student/transport" style={linkStyle(isActive("/student/transport"))}>
            <span style={{opacity: isActive("/student/transport") ? 1 : 0.7}}>🚌</span> Bus Pass
          </Link>
        </li>

        <li style={liStyle(isActive("/student/profile"))}>
          <Link to="/student/profile" style={linkStyle(isActive("/student/profile"))}>
            <span style={{opacity: isActive("/student/profile") ? 1 : 0.7}}>👤</span> Profile
          </Link>
        </li>
      </ul>

      {/* 3. Bottom Profile Section - Clean & Minimal */}
      <div style={bottomSectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
          <div style={avatarStyle}>
            {user?.name ? user.name[0].toUpperCase() : "S"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={userNameStyle}>
              {user?.name || "Student"}
            </div>
            <div style={roleBadgeStyle}>
              Student Portal
            </div>
          </div>
        </div>
        
        <button
          onClick={() => { 
            localStorage.clear();
            window.location.href = "/login"; 
          }}
          style={logoutBtnStyle}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// --- SOFT & EYE-PLEASANT STYLES (UNTOUCHED) ---

const sidebarContainerStyle = {
  width: "260px",
  background: "#f9fafb", 
  height: "100vh",
  borderRight: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const logoIconStyle = {
  width: "35px",
  height: "35px",
  background: "#0d9488", 
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: "bold",
  fontSize: "1rem"
};

const logoTextStyle = {
  fontSize: "1.05rem",
  fontWeight: "700",
  color: "#111827", 
  letterSpacing: "-0.3px"
};

const liStyle = (active) => ({
  marginBottom: "4px",
  borderRadius: "8px",
  background: active ? "#ccfbf1" : "transparent", 
  transition: "0.2s all ease-in-out"
});

const linkStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 16px",
  textDecoration: "none",
  color: active ? "#0f766e" : "#4b5563", 
  fontWeight: active ? "700" : "500",
  fontSize: "14px"
});

const bottomSectionStyle = {
  padding: "20px",
  borderTop: "1px solid #e5e7eb",
  background: "#f3f4f6", 
  marginTop: "auto"
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  background: "#ffffff",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0d9488",
  fontWeight: "bold",
  border: "1px solid #e5e7eb"
};

const userNameStyle = {
  fontWeight: "600",
  color: "#1f2937",
  fontSize: "13.5px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis"
};

const roleBadgeStyle = {
  color: "#6b7280",
  fontSize: "10px",
  textTransform: "uppercase",
  fontWeight: "600",
  letterSpacing: "0.5px"
};

const logoutBtnStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
}