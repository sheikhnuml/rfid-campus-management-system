import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

export default function About() {
  return (
    <div style={pageWrapper}>
      <div style={headerSection}>
        <BackButton /> {/* 🟢 Your component added here */}
        <h1 style={titleStyle}>About <span style={{color: "#4f46e5"}}>CampusAccess</span></h1>
      </div>

      <div style={contentCard}>
        <p style={textStyle}>
          CampusAccess is a state-of-the-art RFID-based management system. 
          Our mission is to digitalize the university experience by providing a single, secure identity for 
          every student and staff member.
        </p>
        <p style={textStyle}>
          From automated attendance to cashless cafe payments, we bring efficiency and transparency 
          to campus life through advanced IoT infrastructure.
        </p>
      </div>
    </div>
  );
}

// Styles to match your Portal theme
const pageWrapper = { minHeight: "100vh", background: "#f8fafc", padding: "40px 8%", fontFamily: "'Inter', sans-serif" };
const headerSection = { display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" };
const titleStyle = { fontSize: "2.5rem", fontWeight: "900", color: "#1e293b", margin: 0 };
const contentCard = { background: "white", padding: "40px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" };
const textStyle = { fontSize: "1.1rem", color: "#64748b", lineHeight: "1.8", marginBottom: "20px" };