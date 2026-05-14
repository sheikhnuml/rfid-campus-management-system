import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Terminal() {
  const [mode, setMode] = useState(() => {
    const role = localStorage.getItem("role");
    if (role === "security") return "GATE";
    if (role === "cafe") return "CAFE";
    if (role === "transport") return "TRANSPORT";
    return "ATTENDANCE"; 
  });

  const [rfid, setRfid] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // 🟢 Socket Listener
  useEffect(() => {
    socket.on("new-rfid-captured", (tag) => {
      if (!scanResult && !activeStudent) handleSmartScan(tag);
    });

    socket.on("rfid-collision", (data) => {
      if (!scanResult && !activeStudent) handleSmartScan(data.tag);
    });

    return () => {
      socket.off("new-rfid-captured");
      socket.off("rfid-collision");
    };
  }, [mode, scanResult, activeStudent]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [mode, scanResult, activeStudent]);

  const handleSmartScan = async (tag) => {
    setLoading(true);
    try {
      if (mode === "ATTENDANCE") {
        const res = await axios.post("http://localhost:5000/api/scan/identify", { rfidTag: tag });
        if (res.data.user) {
          setActiveStudent(res.data.user);
        } else {
          throw new Error("Missing data");
        }
      } else {
        const endpoint = mode === "TRANSPORT" ? "http://localhost:5000/api/transport/scan" : "http://localhost:5000/api/scan";
        const res = await axios.post(endpoint, { rfidTag: tag, mode });
        setScanResult({
          type: "success",
          message: res.data.message,
          user: res.data.user || { name: res.data.name, studentId: res.data.id }
        });
      }
    } catch (err) {
      setScanResult({
        type: "error",
        message: err.response?.data?.message || "Scan Failed! Check Card Registration."
      });
    } finally {
      setLoading(false);
      setRfid("");
      if (mode !== "ATTENDANCE") setTimeout(() => setScanResult(null), 3000);
    }
  };

  const markAttendance = async (subjectName) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/scan", {
        rfidTag: activeStudent.rfidTag || activeStudent.studentId,
        mode: "ATTENDANCE",
        subject: subjectName
      });
      setScanResult({ type: "success", message: res.data.message, user: res.data.user });
      setActiveStudent(null);
    } catch (err) {
      setScanResult({ type: "error", message: err.response?.data?.message || "Error!" });
    } finally {
      setLoading(false);
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  return (
    <div style={terminalContainerStyle}>
      <div style={headerStyle}>
        <button onClick={() => navigate(-1)} style={backBtnStyle}>← Back</button>
        <div style={modeGroupStyle}>
          {["ATTENDANCE", "CAFE", "TRANSPORT", "GATE"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setScanResult(null); setActiveStudent(null); }} style={mode === m ? activeModeBtn : inactiveModeBtn}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={mainCardStyle}>
        {!scanResult ? (
          activeStudent ? (
            <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
              <h3 style={{ color: "#1e293b", margin: 0 }}>{activeStudent.name}</h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>ID: {activeStudent.studentId}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", maxWidth: "450px" }}>
                {activeStudent.subjects?.map((sub) => (
                  <button key={sub} onClick={() => markAttendance(sub)} style={activeModeBtn}>{sub}</button>
                ))}
              </div>
              <button onClick={() => setActiveStudent(null)} style={{ marginTop: "25px", background: "none", border: "none", color: "#ef4444", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>{mode === "ATTENDANCE" ? "📝" : mode === "CAFE" ? "☕" : mode === "TRANSPORT" ? "🚌" : "🏢"}</div>
              <p style={{ fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Ready for {mode} Scan</p>
              <form onSubmit={(e) => { e.preventDefault(); if(rfid) handleSmartScan(rfid); }} style={{ marginTop: "20px" }}>
                <input ref={inputRef} type="text" placeholder="Tap Card..." value={rfid} onChange={(e) => setRfid(e.target.value)} style={inputStyle} disabled={loading} />
              </form>
              {loading && <p style={{ marginTop: "10px", color: "#4f46e5", fontWeight: "600" }}>Identifying Student...</p>}
            </div>
          )
        ) : (
          <div style={{ textAlign: "center", animation: "popIn 0.3s", color: scanResult.type === "success" ? "#10b981" : "#ef4444" }}>
            <div style={{ fontSize: "80px", marginBottom: "10px" }}>{scanResult.type === "success" ? "✅" : "❌"}</div>
            <h2 style={{ fontSize: "2rem", margin: 0 }}>{scanResult.message}</h2>
            {scanResult.user && <p style={{ fontWeight: "700", color: "#1e293b" }}>{scanResult.user.name}</p>}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .card { background: white; padding: 60px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
      `}</style>
    </div>
  );
}

// STYLES... (Preserved your exact styles)
const terminalContainerStyle = { height: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", fontFamily: "'Segoe UI', Roboto, sans-serif" };
const headerStyle = { width: "100%", maxWidth: "900px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px" };
const modeGroupStyle = { display: "flex", background: "#fff", padding: "5px", borderRadius: "12px", border: "1px solid #e2e8f0" };
const mainCardStyle = { width: "100%", maxWidth: "700px", minHeight: "350px", display: "flex", justifyContent: "center", alignItems: "center" };
const inputStyle = { width: "250px", padding: "15px", borderRadius: "12px", border: "2px solid #1e293b", fontSize: "18px", textAlign: "center", outline: "none" };
const backBtnStyle = { padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };
const activeModeBtn = { padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" };
const inactiveModeBtn = { padding: "10px 20px", background: "transparent", color: "#64748b", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" };