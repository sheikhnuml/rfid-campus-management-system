import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudentWallet() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ lastTopup: 0, totalSpent: 0, lastTopupDate: "N/A" });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const syncInterval = useRef(null);

  useEffect(() => {
    if (user.studentId) {
      fetchWalletData(true);

      syncInterval.current = setInterval(() => {
        fetchWalletData(false);
      }, 5000);
    }

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, []);

  const fetchWalletData = async (isInitialLoad) => {
    try {
      if (isInitialLoad) setLoading(true);

      const [uRes, tRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users"),
        axios.get("http://localhost:5000/api/finance/history")
      ]);

      const profile = uRes.data.find(u => u.studentId === user.studentId);
      const myLogs = tRes.data.filter(t => t.studentId === user.studentId);

      setWalletBalance(profile?.wallet || 0);
      setTransactions(myLogs);

      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      let spentThisMonth = 0;
      let lastTopupVal = 0;
      let lastTopupDateStr = "N/A";

      myLogs.forEach(tx => {
        const txDate = new Date(tx.createdAt);
        if (tx.amount < 0 && txDate >= firstDayOfMonth) {
          spentThisMonth += Math.abs(tx.amount);
        }
        if (tx.amount > 0 && lastTopupVal === 0) {
          lastTopupVal = tx.amount;
          lastTopupDateStr = txDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      });

      setStats({
        lastTopup: lastTopupVal,
        totalSpent: spentThisMonth,
        lastTopupDate: lastTopupDateStr
      });

      if (isInitialLoad) setLoading(false);
    } catch (err) {
      console.error("Wallet Sync Error:", err);
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transaction history found.");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text("TRANSACTION STATEMENT", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Student Name: ${user.name || "N/A"}`, 14, 32);
      doc.text(`Student ID: ${user.studentId || "N/A"}`, 14, 38);
      doc.text(`Current Balance: Rs. ${parseFloat(walletBalance).toFixed(2)}`, 14, 44);
      doc.text(`Report Date: ${new Date().toLocaleString()}`, 14, 50);
      
      doc.setDrawColor(200);
      doc.line(14, 55, 196, 55);

      const tableRows = transactions.map(t => [
        t.amount < 0 ? "Cafe Purchase" : "Account Top-up",
        t.amount < 0 ? "Debit" : "Credit",
        new Date(t.createdAt).toLocaleDateString(),
        `Rs. ${Math.abs(t.amount).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 60,
        head: [['Details', 'Type', 'Date', 'Amount']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [74, 108, 247], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
      });

      doc.save(`Statement_${user.studentId}_${user.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Critical PDF Error:", error);
      alert("PDF generation failed.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Syncing Digital Wallet...</div>;

  return (
    <div style={{ padding: "10px", animation: "fadeIn 0.5s ease", fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h2 className="admin-title" style={{ marginBottom: "20px", color: "#1e293b" }}>
        Digital Wallet — Finance Overview <span style={{fontSize: '10px', color: '#16a34a', verticalAlign: 'middle'}}>● Live</span>
      </h2>

      <div className="dash-grid-3" style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <div className="card" style={{ flex: 1.5, borderTop: "4px solid #4a6cf7", padding: "15px" }}>
          <p style={labelStyle}>Current Balance</p>
          <h2 style={{ color: "#4a6cf7", fontSize: "2.2rem", margin: "10px 0" }}>Rs {Number(walletBalance).toFixed(2)}</h2>
          <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>● RFID Linked</span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #26c2a3", padding: "15px" }}>
          <p style={labelStyle}>Last Top-up</p>
          <h2 style={{ color: "#26c2a3", margin: "10px 0" }}>Rs {stats.lastTopup}</h2>
          <span style={{ fontSize: "11px", color: "#64748b" }}>{stats.lastTopupDate}</span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #6b81ff", padding: "15px" }}>
          <p style={labelStyle}>Total Spent</p>
          <h2 style={{ color: "#6b81ff", margin: "10px 0" }}>Rs {stats.totalSpent}</h2>
          <span style={{ fontSize: "11px", color: "#64748b" }}>This month</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "20px" }}>
        <div>
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ fontSize: "1rem", color: "#1e293b", margin: 0 }}>Recent Activity</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#f8fafc", fontSize: "0.85rem", color: "#64748b" }}>
                  <th style={{ padding: "15px" }}>Transaction Info</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? transactions.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8f9fa" }} className="table-row">
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.95rem" }}>
                        {t.amount < 0 ? "Cafe Purchase" : "Account Top-up"}
                      </div>
                      <div style={{ fontSize: "12px", color: t.amount > 0 ? "#16a34a" : "#ef4444" }}>
                        {t.amount > 0 ? "Credit" : "Debit"}
                      </div>
                    </td>
                    <td style={{ color: "#718096", fontSize: "0.9rem" }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ 
                      textAlign: "right", 
                      paddingRight: "20px", 
                      fontWeight: "800", 
                      color: t.amount > 0 ? "#16a34a" : "#1e293b" 
                    }}>
                      {t.amount > 0 ? "+" : "-"} Rs {Math.abs(t.amount).toFixed(2)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "15px", fontSize: "1rem" }}>Wallet Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <button onClick={generatePDF} className="action-btn" style={actionBtnStyle}>📄 Generate Statement</button>
              <button className="action-btn" style={actionBtnStyle}>❓ Report Issue</button>
              <button className="action-btn" style={{ ...actionBtnStyle,}}>➕ Request Top-up</button>
            </div>
          </div>

          <div className="card" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#475569" }}>Security Tip</h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
              Never share your RFID card or portal password with anyone. Notify admin immediately if your card is lost.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; padding: 20px; border-radius: 15px; border: 1px solid #eef2f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .table-row:hover { background-color: #fcfdff; }
        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { 
          background-color: #f1f5f9 !important; 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .action-btn[style*="background: rgb(74, 108, 247)"]:hover {
          background-color: #3b5bdb !important;
        }
        .action-btn:active { 
          transform: scale(0.96);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}

const labelStyle = { fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" };
const actionBtnStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", color: "#475569", textAlign: "left", width: "100%" };