import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AdminTransport() {
  const [busUsers, setBusUsers] = useState([]);
  const [busLogs, setBusLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  // 🟢 Optimization: Timer ko track karne ke liye ref
  const syncInterval = useRef(null);

  useEffect(() => {
    if (role === "admin") {
      // Pehli baar data mangwao
      fetchTransportData(true);

      // 🟢 Optimization: Har 5 second baad background mein data refresh karein
      syncInterval.current = setInterval(() => {
        fetchTransportData(false); // Background update
      }, 5000);
    } else {
      setLoading(false);
    }

    // 🟢 Optimization: Cleanup interval when leaving page
    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [role]);

  // 🟢 Wrap fetching logic into a reusable function
  const fetchTransportData = async (isInitial) => {
    if (isInitial) setLoading(true);
    
    try {
      // Fetch Users
      const usersRes = await axios.get("http://localhost:5000/api/users");
      const enrolled = usersRes.data.filter(user => 
        user.role === "student" && 
        (user.bus === true || user.bus === "true" || String(user.bus).includes("Yes"))
      );
      setBusUsers(enrolled);

      // Fetch Attendance Logs
      const attendanceRes = await axios.get("http://localhost:5000/api/attendance");
      const validLogs = attendanceRes.data.filter(log => 
        log.subject === "BUS_ENTRY" && 
        log.userId && 
        log.userId.name && 
        log.userId.name !== "Unknown"
      );
      setBusLogs(validLogs);
      
      if (isInitial) setLoading(false);
    } catch (err) {
      console.error("Transport Sync Error:", err);
      if (isInitial) setLoading(false);
    }
  };

  const filteredUsers = busUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease", minHeight: "80vh" }}>
      
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#1e293b", margin: 0, fontWeight: "800" }}>🚌 Transport Management System</h2>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          {role === "admin" ? "Manage and monitor bus enrolled students." : "Access the campus bus scanning terminal."}
          {role === "admin" && <span style={{fontSize: '10px', color: '#10b981', marginLeft: '10px'}}>● Live Syncing</span>}
        </p>
      </div>

      {role === "admin" && (
        <>
          <div style={adminActionRow}>
             <input 
                type="text"
                placeholder="🔍 Search by Name or Student ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle} 
             />
          </div>

          <h4 style={sectionTitle}>Authorized Bus Users</h4>
          <div className="card" style={tableCardStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={{ padding: "15px" }}>ID</th>
                  <th>NAME</th>
                  <th>DEPARTMENT</th>
                  <th>RFID STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                  <tr key={i} style={tableRowStyle}>
                    <td style={{ padding: "15px", fontWeight: "bold" }}>{u.studentId.toUpperCase()}</td>
                    <td style={{ fontWeight: "600" }}>{u.name}</td>
                    <td style={{ color: "#64748b" }}>{u.department}</td>
                    <td><span style={{ color: "#10b981", fontWeight: "bold" }}>● Authorized</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                      No matching students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h4 style={{ ...sectionTitle, marginTop: "40px" }}>📅 Recent Boarding Logs</h4>
          <div className="card" style={tableCardStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={{ padding: "15px" }}>STUDENT ID</th>
                  <th>NAME</th>
                  <th>CHECK-IN DATE</th>
                  <th>CHECK-IN TIME</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {busLogs.length > 0 ? busLogs.map((log, i) => (
                  <tr key={i} style={tableRowStyle}>
                    <td style={{ padding: "15px", fontWeight: "bold" }}>{log.userId?.studentId?.toUpperCase() || "N/A"}</td>
                    <td style={{ fontWeight: "600" }}>{log.userId?.name || "Unknown"}</td>
                    <td style={{ color: "#64748b" }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                    <td style={{ color: "#4f46e5", fontWeight: "bold" }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td><span style={boardingBadge}>Boarded</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                      No boarding records available for active students.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// STYLES (Preserved exactly)
const searchInputStyle = { background: "#f1f5f9", padding: "12px 20px", borderRadius: "10px", color: "#1e293b", fontSize: "14px", width: "350px", border: "1px solid #e2e8f0", outline: "none", transition: "0.2s focus" };
const sectionTitle = { fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "15px" };
const tableCardStyle = { background: "#fff", borderRadius: "15px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tableHeaderStyle = { textAlign: "left", background: "#f8fafc", color: "#64748b", fontSize: "12px" };
const tableRowStyle = { borderBottom: "1px solid #f1f5f9" };
const boardingBadge = { background: "#ecfdf5", color: "#10b981", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" };
const adminActionRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };