import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminGateMonitor() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGateData();
    const interval = setInterval(fetchGateData, 5000); // 5-second auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchGateData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance");
      // Filter only Gate Entries
      const gateLogs = res.data.filter(log => log.subject === "GATE_ENTRY");
      setLogs(gateLogs);
      setLoading(false);
    } catch (err) {
      console.error("Monitoring Error:", err);
      setLoading(false);
    }
  };

  // Stats Logic
  const today = new Date().toLocaleDateString();
  const todaysLogs = logs.filter(l => new Date(l.createdAt).toLocaleDateString() === today);
  const uniqueStudents = [...new Set(todaysLogs.map(l => l.userId?._id))].length;

  // Search/Filter Logic
  const filteredLogs = logs.filter(log => 
    log.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease" }}>
      
      {/* 1. Header & Quick Analytics */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h2 style={{ color: "#1e293b", margin: 0, fontWeight: "800" }}>🛡️ Gate Access Monitoring</h2>
          {/* <p style={{ color: "#64748b", fontSize: "14px" }}>Admin-level security oversight & live tracking</p> */}
        </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={statBox}>Today's Entries: <strong>{todaysLogs.length}</strong></div>
            <div style={{...statBox, background: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7"}}>Unique Students: <strong>{uniqueStudents}</strong></div>
          </div>
      </div>

      {/* 2. Search & Filters */}
      <div className="card" style={searchContainer}>
        <span style={{fontSize: "18px"}}>🔍</span>
        <input 
          type="text" 
          placeholder="Filter by Student Name or ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* 3. Detailed Monitoring Table */}
      <div className="card" style={{ padding: "0", overflow: "hidden", borderRadius: "15px", border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f8fafc", color: "#64748b", fontSize: "12px", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "18px" }}>STUDENT DETAILS</th>
              <th>DEPARTMENT</th>
              <th>CHECK-IN TIME</th>
              <th>DATE</th>
              <th>GATE STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }} className="table-row">
                <td style={{ padding: "15px" }}>
                  <div style={{ fontWeight: "700", color: "#1e293b" }}>{log.userId?.name}</div>
                  <div style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "700" }}>{log.userId?.studentId}</div>
                </td>
                <td style={{ color: "#475569", fontSize: "13px" }}>{log.userId?.department || "Computer Science"}</td>
                <td style={{ color: "#1e293b", fontWeight: "600" }}>
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ color: "#64748b", fontSize: "12px" }}>
                  {new Date(log.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td>
                  <span style={accessBadge}>AUTHORIZED ✅</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  No gate entry logs found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row:hover { background-color: #f8fafc; transition: 0.2s; }
        .card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}

// --- Internal Styling ---
const statBox = { background: "#eef2ff", color: "#4f46e5", padding: "10px 18px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", border: "1px solid #e0e7ff" };
const searchContainer = { display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", marginBottom: "20px", border: "1px solid #e2e8f0" };
const searchInputStyle = { border: "none", outline: "none", width: "100%", fontSize: "15px", fontWeight: "500", color: "#1e293b" };
const accessBadge = { background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" };