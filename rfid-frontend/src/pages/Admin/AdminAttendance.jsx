import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Attendance() {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🟢 Optimization: tRACKING TIME
  const syncInterval = useRef(null);

  useEffect(() => {
    // lOADING SCREEN FOR FETCHING DATA FROM MONGODB
    fetchAttendance(true);

    // 🟢 Optimization: EVERY 5 SEC
    syncInterval.current = setInterval(() => {
      fetchAttendance(false); // Background update (No loading screen)
    }, 5000);

    // Cleanup interval when leaving the page
    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, []);

  const fetchAttendance = async (isInitial) => {
    try {
      if (isInitial) setLoading(true);
      const res = await axios.get("http://localhost:5000/api/attendance");
      setAttendanceLogs(res.data);
      if (isInitial) setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (isInitial) setLoading(false);
    }
  };

  // --- Logic 1: Data Formatting (FIXED: Filtering Gate, Bus AND Unknown entries) ---
  const formatted = attendanceLogs
    .filter(log => 
      log.subject !== "GATE_ENTRY" && 
      log.subject !== "BUS_ENTRY" && 
      log.userId && 
      log.userId.name && 
      log.userId.name !== "Unknown"
    )
    .map((log, index) => ({
      id: index + 1,
      studentId: log.userId?.studentId || "N/A",
      name: log.userId?.name || "Unknown",
      subject: log.subject || "General",
      time: new Date(log.createdAt).toLocaleString("en-PK", { 
        dateStyle: "medium", 
        timeStyle: "short" 
      }),
      status: log.status.toUpperCase(),
    }));

  // --- Logic 2: Analytics Calculations ---
  const totalScans = formatted.length;
  const lateCount = formatted.filter(l => l.status === "LATE").length;
  const presentCount = totalScans - lateCount;

  // --- Logic 3: Search Filter ---
  const filteredData = formatted.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: "20px" }}>Loading Attendance Records...</div>;

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2 style={{ color: "#1e293b", fontWeight: "800", margin: 0 }}>📅 Attendance Insights</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontSize: "12px", fontWeight: "bold" }}>
          <span className="dot"></span> Live Scan Feed
        </div>
      </div>

      {/* 📊 ANALYTICS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="card" style={statCardStyle("#4f46e5")}>
          <div style={iconCircleStyle}>📑</div>
          <div>
            <p style={cardLabelStyle}>Total Scans</p>
            <h2 style={cardValueStyle}>{totalScans}</h2>
          </div>
        </div>
        <div className="card" style={statCardStyle("#10b981")}>
          <div style={iconCircleStyle}>✅</div>
          <div>
            <p style={cardLabelStyle}>On-Time Scans</p>
            <h2 style={cardValueStyle}>{presentCount}</h2>
          </div>
        </div>
        <div className="card" style={statCardStyle("#f59e0b")}>
          <div style={iconCircleStyle}>⏰</div>
          <div>
            <p style={cardLabelStyle}>Late Arrivals</p>
            <h2 style={cardValueStyle}>{lateCount}</h2>
          </div>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="card" style={searchBoxStyle}>
        <span style={{ fontSize: "20px" }}>🔍</span>
        <input 
          type="text" 
          placeholder="Search by Student Name, ID or Subject " 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "12px", border: "none", outline: "none", fontSize: "16px", fontWeight: "500" }}
        />
      </div>

      {/* ATTENDANCE TABLE CARD */}
      <div className="card" style={tableWrapperStyle}>
        <div style={{ padding: "20px 25px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <h3 style={{ margin: 0, fontSize: "15px", color: "#1e293b" }}>Attendance History Log</h3>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                <th style={thStyle}>Sr. No</th>
                <th style={thStyle}>Student ID</th>
                <th style={thStyle}>Student Name</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}><span style={{ color: "#94a3b8", fontWeight: "600" }}>#{log.id}</span></td>
                    <td style={tdStyle}><strong>{log.studentId.toUpperCase()}</strong></td>
                    <td style={tdStyle}>{log.name}</td>
                    <td style={tdStyle}>
                      <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                        {log.subject}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#64748b", fontSize: "13px" }}>{log.time}</td>
                    <td style={tdStyle}>
                      <span style={statusBadge(log.status)}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                    {searchTerm ? `No records found for "${searchTerm}"` : "No attendance data available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .dot { height: 8px; width: 8px; background-color: #10b981; border-radius: 50%; display: inline-block; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const statCardStyle = (color) => ({
  background: "#fff", padding: "20px", borderRadius: "20px", borderLeft: `6px solid ${color}`,
  display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
});
const iconCircleStyle = { width: "45px", height: "45px", background: "#f1f5f9", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const cardLabelStyle = { margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" };
const cardValueStyle = { margin: 0, color: "#1e293b", fontSize: "28px", fontWeight: "800" };
const searchBoxStyle = { padding: "10px 20px", marginBottom: "25px", background: "#fff", borderRadius: "15px", border: "2px solid #eef2ff", display: "flex", alignItems: "center", gap: "10px" };
const tableWrapperStyle = { background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" };
const thStyle = { padding: "15px 20px", fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" };
const tdStyle = { padding: "18px 20px", fontSize: "14px", color: "#1e293b" };
const statusBadge = (status) => ({
  fontSize: "10px", padding: "4px 10px", borderRadius: "20px", fontWeight: "800",
  background: status === "PRESENT" ? "#f0fdf4" : "#fff7ed",
  color: status === "PRESENT" ? "#16a34a" : "#ea580c",
  border: `1px solid ${status === "PRESENT" ? "#dcfce7" : "#ffedd5"}`
});