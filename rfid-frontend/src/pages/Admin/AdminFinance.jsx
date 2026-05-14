import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Finance() {
  const [userTag, setUserTag] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const historyRes = await axios.get("http://localhost:5000/api/finance/history");
      const studentsRes = await axios.get("http://localhost:5000/api/users");
      
      // Tahir bhai, yahan hum transactions ko filter kar rahay hain sirf positive amounts ke liye
      setTransactions(historyRes.data.filter(t => t.amount > 0));
      setStudents(studentsRes.data.filter(u => u.role === "student"));
      setLoading(false);
    } catch (err) { 
      console.error(err); 
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.studentId.toLowerCase().includes(userTag.toLowerCase()) ||
    s.name.toLowerCase().includes(userTag.toLowerCase())
  ).slice(0, 5);

  const onTopUp = async (e) => {
    if (e) e.preventDefault();
    setMsg({ type: "info", text: "Processing..." });

    try {
      const res = await axios.post("http://localhost:5000/api/wallet/topup", {
        studentId: userTag,
        amount: Number(amount),
      });

      if (res.data.success) {
        setMsg({ type: "success", text: `Rs. ${amount} added to ${userTag}!` });
        setUserTag("");
        setAmount("");
        fetchData();
      }
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Transaction failed." });
    }
  };

  // 🟢 LOGIC FIXED: Ab yeh current wallets ko nahi dekhega, 
  // balkay jo transactions add ki hain unka total sum dikhaye ga.
  const totalVault = transactions.reduce((acc, t) => acc + t.amount, 0);
  
  const lowBalanceCount = students.filter(s => s.wallet < 150).length;

  if (loading) return <div style={{ padding: "20px" }}>Loading Financial Records...</div>;

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ color: "#1e293b", fontWeight: "800", marginBottom: "25px" }}>💎 Finance & Wallet Management</h2>

      {/* 📊 ANALYTICS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="card" style={statCardStyle("#4f46e5")}>
          <div style={iconCircleStyle}>💰</div>
          <div>
            <p style={cardLabelStyle}>Total Disbursed Credits</p>
            <h2 style={cardValueStyle}>Rs. {totalVault.toLocaleString()}</h2>
          </div>
        </div>
        <div className="card" style={statCardStyle("#10b981")}>
          <div style={iconCircleStyle}>💳</div>
          <div><p style={cardLabelStyle}>Active Wallets</p><h2 style={cardValueStyle}>{students.length} Students</h2></div>
        </div>
        <div className="card" style={statCardStyle("#f59e0b")}>
          <div style={iconCircleStyle}>⚠️</div>
          <div><p style={cardLabelStyle}>Low Balance Alerts</p><h2 style={cardValueStyle}>{lowBalanceCount} Users</h2></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "25px" }}>
        
        <div className="card" style={{ padding: "25px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", height: "fit-content" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "18px", color: "#4f46e5" }}>⚡ Quick Recharge</h3>
          <form onSubmit={onTopUp} style={{ display: "flex", flexDirection: "column", gap: "15px", position: "relative" }}>
            
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Student ID / Name</label>
              <input 
                style={inputStyle} 
                placeholder="Enter Student ID or Name" 
                value={userTag} 
                onChange={(e) => {
                  setUserTag(e.target.value);
                  setShowSuggestions(true);
                }} 
                onFocus={() => setShowSuggestions(true)}
                required 
              />
              
              {showSuggestions && userTag && filteredStudents.length > 0 && (
                <div style={dropdownWrapperStyle}>
                  {filteredStudents.map((s) => (
                    <div 
                      key={s._id} 
                      style={suggestionItemStyle}
                      onClick={() => {
                        setUserTag(s.studentId);
                        setShowSuggestions(false);
                      }}
                    >
                      <div style={{fontWeight: "700"}}>{s.studentId}</div>
                      <div style={{fontSize: "10px", color: "#64748b"}}>{s.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Top-up Amount (Rs)</label>
              <input style={inputStyle} type="number" placeholder="Enter Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <button style={mainBtnStyle} type="submit">Add Funds to Wallet</button>
          </form>

          {msg.text && (
            <div style={{ 
              marginTop: "15px", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
              background: msg.type === "success" ? "#f0fdf4" : msg.type === "error" ? "#fef2f2" : "#eff6ff",
              color: msg.type === "success" ? "#16a34a" : msg.type === "error" ? "#dc2626" : "#4f46e5",
              textAlign: "center"
            }}>
              {msg.text}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: "0", background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>Recent Top-Up Logs</h3>
          </div>
          <div style={{ maxHeight: "450px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                  <th style={thStyle}>Student ID</th>
                  <th style={thStyle}>Amount Added</th>
                  <th style={thStyle}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}><strong>{t.studentId.toUpperCase()}</strong></td>
                    <td style={{ ...tdStyle, color: "#10b981", fontWeight: "800" }}>+ Rs. {t.amount}</td>
                    <td style={{ ...tdStyle, color: "#64748b", fontSize: "12px" }}>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "25px", padding: "0", background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>Student Wallet Balances</h3>
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                <th style={thStyle}>Student Details</th>
                <th style={thStyle}>ID</th>
                <th style={{...thStyle, textAlign: "right"}}>Current Balance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={tdStyle}><div style={{ fontWeight: "700", color: "#1e293b" }}>{s.name}</div></td>
                  <td style={tdStyle}><span style={{color: "#64748b", fontWeight: "600"}}>{s.studentId}</span></td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: "800", fontSize: "16px", color: s.wallet < 150 ? "#ef4444" : "#1e293b" }}>
                    Rs. {s.wallet.toFixed(2)}
                    {s.wallet < 150 && <span style={{fontSize: "10px", display: "block", color: "#ef4444"}}>⚠️ Low Balance</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const dropdownWrapperStyle = {
  position: "absolute", top: "100%", left: 0, right: 0, background: "white",
  borderRadius: "10px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 10,
  border: "1px solid #e2e8f0", marginTop: "5px", overflow: "hidden"
};
const suggestionItemStyle = {
  padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #f1f5f9",
  transition: "0.2s", ":hover": { background: "#f8fafc" }
};
const statCardStyle = (color) => ({ background: "#fff", padding: "20px", borderRadius: "20px", borderLeft: `6px solid ${color}`, display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" });
const iconCircleStyle = { width: "45px", height: "45px", background: "#f1f5f9", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const cardLabelStyle = { margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" };
const cardValueStyle = { margin: 0, color: "#1e293b", fontSize: "24px", fontWeight: "800" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", boxSizing: "border-box" };
const labelStyle = { fontSize: "11px", color: "#64748b", fontWeight: "700", marginBottom: "4px", display: "block", textTransform: "uppercase" };
const mainBtnStyle = { padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" };
const thStyle = { padding: "15px 20px", fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" };
const tdStyle = { padding: "18px 20px", fontSize: "14px" };