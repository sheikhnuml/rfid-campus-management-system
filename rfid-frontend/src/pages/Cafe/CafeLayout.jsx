import React, { useState, useEffect, useRef } from "react";
import { Navigate, Routes, Route } from "react-router-dom"; 
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import CafeProfile from "./CafeProfile"; 
import io from "socket.io-client";

// 🟢 Automatic Detection Logic
const SERVER_IP = window.location.hostname;
const BASE_URL = `http://${SERVER_IP}:5000`;

const socket = io(BASE_URL);


export default function CafeLayout() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, transactions: 0 });
  const [billAmount, setBillAmount] = useState(""); 
  const [isWaiting, setIsWaiting] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false); 
  const [msg, setMsg] = useState({ type: "", text: "" });
  
  const role = localStorage.getItem("role");

  const fetchCafeData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/finance/history`);
      const cafePayments = res.data.filter(t => t.amount < 0);
      const total = cafePayments.reduce((acc, t) => acc + Math.abs(t.amount), 0);
      setStats({ totalSales: total, transactions: cafePayments.length });
      setTransactions(cafePayments);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchCafeData();
  }, []);

  useEffect(() => {
    // 1. Transaction Success Case
    socket.on("cafe-payment-done", (data) => {
      fetchCafeData(); 
      setMsg({ type: "success", text: `✅ Rs. ${data.amount} deducted from ${data.userName}` });
      setIsWaiting(false);
      setIsProcessing(false);
      setBillAmount("");
      setTimeout(() => setMsg({ type: "", text: "" }), 5000);
    });

    socket.on("cafe-payment-failed", (data) => {
      setMsg({ type: "error", text: `⚠️ ${data.message} (${data.userName})` });
      

      setIsWaiting(false);
      setIsProcessing(false);
      setBillAmount(""); 

      setTimeout(() => setMsg({ type: "", text: "" }), 5000);
    });

    return () => {
      socket.off("cafe-payment-done");
      socket.off("cafe-payment-failed");
    };
  }, []);

  useEffect(() => {
    const handleTag = (tag) => {
      if (isWaiting && !isProcessing && billAmount > 0) {
        processPayment(tag);
      }
    };
    socket.on("new-rfid-captured", handleTag);
    socket.on("rfid-collision", (data) => handleTag(data.tag));
    return () => {
      socket.off("new-rfid-captured");
      socket.off("rfid-collision");
    };
  }, [isWaiting, isProcessing, billAmount]);

  const processPayment = async (tag) => {
    setIsWaiting(false);
    setIsProcessing(true);
    setMsg({ type: "info", text: "⚙️ Processing Payment..." });
    try {
      await axios.post(`${BASE_URL}/api/scan`, {
        rfidTag: tag,
        amount: Number(billAmount),
        mode: "CAFE"
      });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Payment Failed!" });
      setIsProcessing(false);
      setIsWaiting(true); 
    }
  };

  const startScanMode = async (e) => {
    if (e) e.preventDefault();
    if (!billAmount || billAmount <= 0) {
      setMsg({ type: "error", text: "⚠️ Please enter an amount first!" });
      return;
    }
    try {
      await axios.post(`${BASE_URL}/api/cafe/set-amount`, { amount: Number(billAmount) });
      setIsWaiting(true);
      setMsg({ type: "info", text: "📡 System Active: Tap student card on Pi now..." });
    } catch (err) {
      setMsg({ type: "error", text: "❌ Connection Error!" });
    }
  };

  if (role !== "cafe" && role !== "admin") return <Navigate to="/login" replace />;

  const CafeDashboard = (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", marginBottom: "30px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div className="card" style={statCardStyle("#4f46e5")}>
            <span style={{ fontSize: "24px" }}>💰</span>
            <div>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Total Revenue</p>
              <h2 style={{ margin: 0 }}>Rs. {stats.totalSales}</h2>
            </div>
          </div>
          <div className="card" style={statCardStyle("#10b981")}>
            <span style={{ fontSize: "24px" }}>🛒</span>
            <div>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Total Orders</p>
              <h2 style={{ margin: 0 }}>{stats.transactions}</h2>
            </div>
          </div>
        </div>

        <div className="card" style={{ 
          padding: "30px", borderRadius: "24px", background: "#fff", 
          boxShadow: isWaiting ? "0 0 30px rgba(79, 70, 229, 0.2)" : "0 10px 25px rgba(0,0,0,0.05)",
          border: isProcessing ? "2px solid #10b981" : isWaiting ? "2px solid #4f46e5" : "2px solid transparent",
          transition: "0.4s"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0 }}>
              {isProcessing ? "🎉 Payment Done" : isWaiting ? "Waiting for Card..." : "New Transaction"}
            </h3>
            {isWaiting && <div className="pulse-loader"></div>}
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {[50, 100, 150, 200].map(amt => (
              <button key={amt} disabled={isProcessing || isWaiting} onClick={() => setBillAmount(amt)} style={presetBtnStyle(billAmount == amt, isProcessing || isWaiting)}>
                Rs. {amt}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input type="number" placeholder="0.00" value={billAmount} disabled={isProcessing || isWaiting} onChange={(e) => setBillAmount(e.target.value)} style={modernInputStyle} />
              <span style={{ position: "absolute", left: "15px", top: "12px", fontWeight: "800", color: "#64748b" }}>Rs.</span>
            </div>
            <button disabled={isProcessing} onClick={isWaiting ? () => {setIsWaiting(false); setMsg({type:"", text:""})} : startScanMode} style={isProcessing ? disabledBtnStyle : isWaiting ? cancelBtnStyle : payBtnStyle}>
              {isProcessing ? "Wait..." : isWaiting ? "Cancel Scan" : "Charge Card"}
            </button>
          </div>

          {msg.text && (
            <div style={{ 
              marginTop: "20px", padding: "12px 18px", borderRadius: "12px", fontSize: "14px", fontWeight: "600",
              background: msg.type === "success" ? "#dcfce7" : msg.type === "error" ? "#fee2e2" : "#e0e7ff",
              color: msg.type === "success" ? "#16a34a" : msg.type === "error" ? "#dc2626" : "#4f46e5",
              display: "flex", alignItems: "center", gap: "10px"
            }}>
              <span>{msg.type === "success" ? "✅" : msg.type === "error" ? "❌" : "🛰️"}</span>
              {msg.text}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: "0", borderRadius: "20px", overflow: "hidden", background: "#fff" }}>
         <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f8fafc" }}>
              <th style={thStyle}>Student</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 8).map((t) => (
              <tr key={t._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: "700" }}>{t.userName || "Student"}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{t.studentId}</div>
                </td>
                <td style={{ ...tdStyle, color: "#dc2626", fontWeight: "800" }}>- Rs. {Math.abs(t.amount)}</td>
                <td style={tdStyle}><span style={badgeStyle}>COMPLETED</span></td>
                <td style={{ ...tdStyle, color: "#64748b" }}>{new Date(t.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="layout" style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <div className="main-area" style={{ flex: 1, padding: "0 20px" }}>
        <Navbar title="Smart Cafe POS" />
        <Routes>
          <Route index element={CafeDashboard} />
          <Route path="profile" element={<CafeProfile />} />
        </Routes>
      </div>
      <style>{`
        .pulse-loader { width: 12px; height: 12px; background: #4f46e5; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
      `}</style>
    </div>
  );
}

// STYLES (Preserved exactly)
const disabledBtnStyle = { padding: "0 30px", background: "#cbd5e1", color: "#64748b", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "not-allowed" };
const badgeStyle = { background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" };
const statCardStyle = (color) => ({ background: color, color: "white", padding: "20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: `0 10px 20px ${color}33` });
const modernInputStyle = { width: "100%", padding: "12px 12px 12px 45px", borderRadius: "14px", border: "2px solid #e2e8f0", outline: "none", fontSize: "18px", fontWeight: "800", color: "#1e293b" };
const payBtnStyle = { padding: "0 30px", background: "#1e293b", color: "white", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer" };
const cancelBtnStyle = { ...payBtnStyle, background: "#ef4444" };
const presetBtnStyle = (active, disabled) => ({
  padding: "8px 15px", borderRadius: "10px", border: active ? "2px solid #4f46e5" : "2px solid #f1f5f9",
  background: active ? "#eef2ff" : "#f8fafc", color: active ? "#4f46e5" : "#64748b",
  fontWeight: "700", cursor: disabled ? "not-allowed" : "pointer", fontSize: "12px", opacity: disabled ? 0.5 : 1
});
const thStyle = { padding: "15px 25px", fontSize: "11px", color: "#64748b", textTransform: "uppercase" };
const tdStyle = { padding: "18px 25px", fontSize: "14px" };