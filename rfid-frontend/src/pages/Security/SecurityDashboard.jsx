import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SecurityDashboard() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000); // 🟢 Auto-refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance");
      // Filter only Gate Entries
      const gateLogs = res.data.filter(log => log.subject === "GATE_ENTRY");
      setLogs(gateLogs);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ color: "#1e293b", margin: 0 }}>🛡️ Gate Entry Monitoring</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Real-time student check-in feed</p>
        </div>
        <div style={statsBadge}>Total Entries Today: {logs.length}</div>
      </div>

      <div className="card" style={tableContainerStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f8fafc", color: "#64748b", fontSize: "12px" }}>
              <th style={{ padding: "18px" }}>STUDENT DETAILS</th>
              <th>DEPARTMENT</th>
              <th>ENTRY TIME</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? logs.map((log, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "15px" }}>
                  <div style={{ fontWeight: "700", color: "#1e293b" }}>{log.userId?.name}</div>
                  <div style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "600" }}>{log.userId?.studentId}</div>
                </td>
                <td style={{ color: "#475569", fontSize: "13px" }}>{log.userId?.department || "N/A"}</td>
                <td style={{ color: "#1e293b", fontWeight: "600" }}>
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <span style={entryBadge}>Verified Entry ✅</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Waiting for scans...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Styles ---
const tableContainerStyle = { background: "#fff", borderRadius: "15px", border: "1px solid #e2e8f0", overflow: "hidden" };
const entryBadge = { background: "#f0fdf4", color: "#16a34a", padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" };
const statsBadge = { background: "#4f46e5", color: "white", padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px" };