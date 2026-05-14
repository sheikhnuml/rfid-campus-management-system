import React from "react";

export default function StudentTransport() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  // 🟢 RFID Masking Logic: FIRST 3 AND LAST 3 
  const maskRFID = (tag) => {
    if (!tag) return "N/A";
    if (tag.length <= 6) return tag; // LESS THEN AND EQUAL TO 5 THEN DONT MASK
    return `${tag.slice(0, 3)}XXXXXX${tag.slice(-3)}`;
  };

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ color: "#1e293b", marginBottom: "20px" }}>🚌 My Transport Details</h2>

      {user?.bus ? (
        <div style={passContainer}>
          <div style={busPassCard}>
            <div style={passHeader}>
              <span style={{ fontWeight: "800" }}>CAMPUS BUS PASS</span>
              <span style={statusBadge}>ACTIVE ✅</span>
            </div>
            
            <div style={passBody}>
              <div style={infoGroup}>
                <label style={labelStyle}>STUDENT NAME</label>
                <div style={valueStyle}>{user.name}</div>
              </div>
              <div style={infoGroup}>
                <label style={labelStyle}>ROUTE / STOP</label>
                <div style={valueStyle}>{user.busRoute || "Route 1"} - {user.busStop || "Main Stop"}</div>
              </div>
              <div style={infoGroup}>
                <label style={labelStyle}>RFID SERIAL</label>
                {/* 🟢 Masked RFID Tag applied here */}
                <div style={valueStyle}>{maskRFID(user.rfidTag)}</div>
              </div>
            </div>

            <div style={passFooter}>
              Present this card at the bus terminal for entry.
            </div>
          </div>

          <div className="card" style={{ marginTop: "25px", padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>📢 Important Instructions</h3>
            <ul style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.8" }}>
              <li>Always keep your RFID card ready before boarding.</li>
              <li>Unauthorized card usage may lead to a permanent block.</li>
              <li>In case of loss, contact the Transport Office immediately.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div style={notEnrolledCard}>
          <div style={{ fontSize: "50px" }}>🚫</div>
          <h3 style={{ color: "#1e293b" }}>Not Enrolled</h3>
          <p style={{ color: "#64748b", maxWidth: "400px" }}>
            You are not currently enrolled in the Campus Bus Service. Please visit the Transport Office to activate your bus pass.
          </p>
        </div>
      )}
    </div>
  );
}

// --- Styles (Same as before) ---
const passContainer = { display: "flex", flexDirection: "column", alignItems: "center" };
const busPassCard = { width: "100%", maxWidth: "450px", background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)", borderRadius: "20px", color: "white", padding: "25px", boxShadow: "0 15px 35px rgba(79, 70, 229, 0.3)" };
const passHeader = { display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "15px", marginBottom: "20px" };
const statusBadge = { background: "#10b981", padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "800" };
const passBody = { display: "flex", flexDirection: "column", gap: "10px" };
const infoGroup = { display: "flex", flexDirection: "column", marginBottom: "5px" };
const labelStyle = { fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: "700", textTransform: "uppercase" };
const valueStyle = { fontSize: "18px", fontWeight: "700", marginBottom: "15px" };
const passFooter = { textAlign: "center", fontSize: "11px", opacity: 0.8, marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "15px" };
const notEnrolledCard = { background: "#fff", padding: "60px 20px", borderRadius: "20px", textAlign: "center", border: "1px solid #e2e8f0" };