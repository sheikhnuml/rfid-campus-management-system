import React, { useState } from "react";
import axios from "axios";

export default function TransportTerminal() {
  const [rfid, setRfid] = useState("");
  const [status, setStatus] = useState(null); // 'granted', 'denied', or null

  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/transport/scan", { rfidTag: rfid });
      setStatus({ type: 'granted', msg: res.data.message, name: res.data.name });
      setRfid(""); // Reset for next scan
    } catch (err) {
      setStatus({ type: 'denied', msg: err.response?.data?.message || "Error" });
      setRfid("");
    }
    // Clear status after 3 seconds
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div style={{ 
      height: "100vh", background: status?.type === 'granted' ? "#10b981" : status?.type === 'denied' ? "#ef4444" : "#1e293b",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", transition: "0.5s" 
    }}>
      <h1 style={{ color: "white", fontSize: "3rem", marginBottom: "20px" }}>🚌 BUS TERMINAL</h1>
      
      {!status ? (
        <form onSubmit={handleScan}>
          <input 
            autoFocus 
            style={{ padding: "20px", borderRadius: "15px", border: "none", fontSize: "20px", textAlign: "center", width: "300px" }}
            placeholder="WAITING FOR SCAN..."
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
          />
        </form>
      ) : (
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "5rem" }}>{status.type === 'granted' ? "✅" : "❌"}</div>
          <h2 style={{ fontSize: "2.5rem" }}>{status.msg}</h2>
          {status.name && <h3 style={{ fontSize: "1.5rem" }}>Welcome, {status.name}</h3>}
        </div>
      )}
    </div>
  );
}