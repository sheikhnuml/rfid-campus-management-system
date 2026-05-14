import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentDashboard() {
  const [data, setData] = useState({
    profile: null,
    attendancePct: 0,
    borrowedCount: 0,
    myBooks: [], 
    cafeHistory: [], 
    recentActivity: [],
    loading: true
  });

  const [showAlert, setShowAlert] = useState(false); 
  const [showCafeModal, setShowCafeModal] = useState(false); 
  const [showIdCard, setShowIdCard] = useState(false); 

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.studentId) {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [uRes, aRes, bRes, fRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users"),
        axios.get("http://localhost:5000/api/attendance"),
        axios.get("http://localhost:5000/api/library/books"),
        axios.get("http://localhost:5000/api/finance/history")
      ]);

      const profile = uRes.data.find(u => u.studentId === user.studentId);
      const myAttLogs = aRes.data.filter(l => l.userId?.studentId === user.studentId);
      const issuedBooks = bRes.data.filter(book => book.issuedTo.some(issue => issue.studentId === user.studentId));
      const myCafeSpend = fRes.data.filter(t => t.studentId === user.studentId && t.amount < 0);

      let combinedActivity = [];
      myAttLogs.forEach(log => {
        combinedActivity.push({ text: `Marked present in **${log.subject}**`, icon: "✅", time: new Date(log.createdAt) });
      });
      issuedBooks.forEach(book => {
        const myIssue = book.issuedTo.find(i => i.studentId === user.studentId);
        combinedActivity.push({ text: `Issued book: **${book.title}**`, icon: "📚", time: new Date(myIssue.issueDate || book.updatedAt) });
      });
      const myFinance = fRes.data.filter(t => t.studentId === user.studentId);
      myFinance.forEach(tx => {
        combinedActivity.push({ text: tx.amount < 0 ? `Purchased at Cafe (Rs ${Math.abs(tx.amount)})` : `Wallet Top-up (Rs ${tx.amount})`, icon: tx.amount < 0 ? "🍔" : "💳", time: new Date(tx.createdAt) });
      });

      combinedActivity.sort((a, b) => b.time - a.time);
      const totalConducted = 30;
      const pct = Math.round((myAttLogs.length / totalConducted) * 100);

      setData({
        profile,
        attendancePct: pct,
        borrowedCount: issuedBooks.length,
        myBooks: issuedBooks,
        cafeHistory: myCafeSpend,
        recentActivity: combinedActivity.slice(0, 6),
        loading: false
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePrint = () => { window.print(); };

  if (data.loading) return <div style={{ padding: "20px" }}>Fetching Real-time Campus Data...</div>;
  if (!user.name) return <div style={{ padding: "20px" }}>Session expired. Please login.</div>;

  return (
    <div style={{ padding: "10px", animation: "fadeIn 0.5s ease", fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      <div className="no-print">
        <h2 className="admin-title">Student Portal — Welcome back, {data.profile?.name || user.name}</h2>

        <div className="dash-grid-3" style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #4a6cf7", padding: "15px" }}>
            <p className="small" style={{ color: "#666", marginBottom: "5px" }}>Attendance</p>
            <h2 style={{ color: "#4a6cf7", margin: 0 }}>{data.attendancePct}%</h2>
            <span style={{ fontSize: "11px", color: data.attendancePct < 75 ? "#dc2626" : "#16a34a" }}>
              {data.attendancePct < 75 ? "⚠️ Below Limit" : "✅ Satisfactory"}
            </span>
          </div>
          <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #26c2a3", padding: "15px" }}>
            <p className="small" style={{ color: "#666", marginBottom: "5px" }}>Cafe Wallet</p>
            <h2 style={{ color: "#26c2a3", margin: 0 }}>Rs {data.profile?.wallet || 0}</h2>
            <span style={{ fontSize: "11px", color: "#666" }}>Current Balance</span>
          </div>
          <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #6b81ff", padding: "15px" }}>
            <p className="small" style={{ color: "#666", marginBottom: "5px" }}>Library</p>
            <h2 style={{ color: "#6b81ff", margin: 0 }}>{data.borrowedCount} Books</h2>
            <span style={{ fontSize: "11px", color: "#666" }}>Currently Issued</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
          <div>
            <div className="card" style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "15px", fontSize: "1rem", color: "#333" }}>Registered Courses & Status</h3>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid #eee", fontSize: "0.85rem", color: "#666" }}>
                    <th style={{ padding: "10px" }}>Subject</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.profile?.subjects || []).map((subjectName, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f8f9fa" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "600", fontSize: "0.9rem" }}>{subjectName}</td>
                      <td>
                        <div style={{ width: "60px", height: "5px", background: "#eee", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ width: `${data.attendancePct}%`, height: "100%", background: "#4a6cf7" }} />
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: "3px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "bold", background: data.attendancePct < 75 ? "#fef2f2" : "#f0fdf4", color: data.attendancePct < 75 ? "#dc2626" : "#16a34a" }}>
                          {data.attendancePct < 75 ? "Warning" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "15px", fontSize: "1rem" }}>Quick Actions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {/* 🟢 Action buttons with class for hover effects */}
                <button onClick={() => setShowAlert(true)} className="dashboard-action-btn" style={actionBtnStyle}>🚨 Due Date Alert</button>
                <button onClick={() => setShowCafeModal(true)} className="dashboard-action-btn" style={actionBtnStyle}>☕ Cafe Pay</button>
                <button onClick={() => setShowIdCard(true)} className="dashboard-action-btn" style={actionBtnStyle}>👤 Profile Card</button>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: "15px", fontSize: "1rem" }}>Recent Activity Feed</h3>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                  {data.recentActivity.map((act, i) => (
                      <li key={i} style={activityItemStyle}>
                          <div style={{fontSize: '18px'}}>{act.icon}</div>
                          <div>
                              <div style={{fontSize: '13px', color: '#333', fontWeight: '500'}}>{act.text}</div>
                              <div style={{fontSize: '10px', color: '#94a3b8'}}>{act.time.toLocaleDateString()} at {act.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                      </li>
                  ))}
                  </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CAFE HISTORY MODAL --- */}
      {showCafeModal && (
        <div style={modalOverlay}>
          <div className="card" style={{ width: "400px", padding: "20px", position: "relative", borderTop: "5px solid #26c2a3" }}>
            <button onClick={() => setShowCafeModal(false)} style={closeBtnStyle}>✕</button>
            <h3 style={{ color: "#1e293b", marginBottom: "15px" }}>☕ Cafe Spending History</h3>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {data.cafeHistory.length > 0 ? data.cafeHistory.map((tx, i) => (
                <div key={i} style={{ marginBottom: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: "13px", fontWeight: "700" }}>Cafe Purchase</div><div style={{ fontSize: "10px", color: "#94a3b8" }}>{new Date(tx.createdAt).toLocaleString()}</div></div>
                  <div style={{ fontWeight: "800", color: "#ef4444" }}>- Rs {Math.abs(tx.amount)}</div>
                </div>
              )) : <p>No transactions found.</p>}
            </div>
          </div>
        </div>
      )}

      {/* --- VIRTUAL ID CARD MODAL --- */}
      {showIdCard && (
        <div style={modalOverlay} className="modal-overlay">
          <div style={{ textAlign: 'center' }}>
            <div style={idCardContainer} className="print-area">
              <div style={idHeader}>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>NATIONAL UNIVERSITY OF MODERN LANGUAGES</div>
                <div style={{ fontSize: '8px', opacity: 0.8 }}>STUDENT ACCESS CARD</div>
              </div>
              <div style={{ padding: '20px', display: 'flex', gap: '20px', background: 'white', textAlign: 'left' }}>
                 <div style={idPhotoBox}><span style={{ fontSize: '40px' }}>👤</span></div>
                 <div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{data.profile?.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {data.profile?.studentId}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>DEPARTMENT</div>
                    <div style={{ fontSize: '11px', fontWeight: '600' }}>{data.profile?.department}</div>
                    <div style={idBadge}>Authorized Student</div>
                 </div>
              </div>
              <div style={idFooter}>RFID TAG: {data.profile?.studentId?.slice(-4)}XXXX</div>
            </div>
            
            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
               <button onClick={handlePrint} className="dashboard-action-btn" style={{ ...actionBtnStyle, background: '#4f46e5', color: 'white', border: 'none' }}>Print / Save PDF</button>
               <button onClick={() => setShowIdCard(false)} className="dashboard-action-btn" style={actionBtnStyle}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Library Alert Modal */}
      {showAlert && (
        <div style={modalOverlay}>
          <div className="card" style={{ width: "400px", padding: "20px", position: "relative", borderTop: "5px solid #ef4444" }}>
            <button onClick={() => setShowAlert(false)} style={closeBtnStyle}>✕</button>
            <h3 style={{ color: "#1e293b", marginBottom: "15px" }}>📚 Issued Books Tracker</h3>
            {data.myBooks.map((book, i) => {
              const myIssue = book.issuedTo.find(is => is.studentId === user.studentId);
              return (
                <div key={i} style={{ marginBottom: "10px", padding: "12px", borderRadius: "10px", borderLeft: "5px solid #10b981", background: "#f8fafc" }}>
                  <div style={{ fontWeight: "700", fontSize: "14px" }}>{book.title}</div>
                  <div style={{ fontSize: "12px" }}>Return by: {new Date(myIssue.returnDate).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print, .no-print * { display: none !important; }
          .modal-overlay { 
            position: absolute !important; 
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            backdrop-filter: none !important;
            visibility: visible !important;
          }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: absolute !important;
            top: 50px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          @page { margin: 0; }
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; padding: 15px; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        
        /* 🟢 NEW: Hover & Press Effects */
        .dashboard-action-btn { transition: all 0.2s ease; }
        .dashboard-action-btn:hover { 
          background-color: #f1f5f9 !important; 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        }
        /* Blue button override */
        .dashboard-action-btn[style*="background: rgb(79, 70, 229)"]:hover {
          background-color: #3b5bdb !important;
        }
        .dashboard-action-btn:active { 
          transform: scale(0.96);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}

const actionBtnStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" };
const activityItemStyle = { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: "12px", padding: "8px", borderRadius: "8px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const closeBtnStyle = { position: "absolute", top: "10px", right: "10px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" };
const idCardContainer = { width: "350px", height: "200px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" };
const idHeader = { background: "#1e3a8a", color: "white", padding: "10px" };
const idPhotoBox = { width: "70px", height: "85px", background: "#f1f5f9", display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid #e2e8f0" };
const idBadge = { fontSize: "8px", fontWeight: "900", background: "#dcfce7", color: "#16a34a", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", marginTop: "5px", display: "inline-block" };
const idFooter = { background: "#f8fafc", padding: "8px", fontSize: "10px", color: "#94a3b8", borderTop: "1px solid #e2e8f0" };