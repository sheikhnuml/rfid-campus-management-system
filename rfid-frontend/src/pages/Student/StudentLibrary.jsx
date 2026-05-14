import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentLibrary() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overdueCount, setOverdueCount] = useState(0);

  const [showRules, setShowRules] = useState(false);

  // 1. Pull user data from local storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.studentId) {
      fetchLibraryData();
    }
  }, []);

  const fetchLibraryData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/library/books");
      
      // 🟢 Logic: Filter books that are issued to THIS specific student
      const myBooks = [];
      let overdue = 0;
      const today = new Date();

      res.data.forEach(book => {
        const issueRecord = book.issuedTo.find(i => i.studentId === user.studentId);
        if (issueRecord) {
          const returnDate = new Date(issueRecord.returnDate);
          if (returnDate < today) overdue++;
          
          myBooks.push({
            id: book._id,
            title: book.title,
            author: book.author,
            dueDate: returnDate.toLocaleDateString(), // Format date nicely
            isOverdue: returnDate < today
          });
        }
      });

      setBorrowedBooks(myBooks);
      setOverdueCount(overdue);
      setLoading(false);
    } catch (err) {
      console.error("Library Fetch Error:", err);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Accessing Library Database...</div>;

  return (
    <div style={{ padding: "10px", animation: "fadeIn 0.5s ease", fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h2 className="admin-title" style={{ marginBottom: "20px", color: "#1e293b" }}>Library Record — Access & Management</h2>

      {/* 1. Top Analytics Row (Now Dynamic) */}
      <div className="dash-grid-3" style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #4a6cf7", padding: "15px" }}>
          <p style={labelStyle}>Books Borrowed</p>
          <h2 style={{ color: "#4a6cf7", margin: "5px 0" }}>{borrowedBooks.length < 10 ? `0${borrowedBooks.length}` : borrowedBooks.length}</h2>
          <span style={{ fontSize: "11px", color: "#16a34a" }}>✅ Active Records</span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #26c2a3", padding: "15px" }}>
          <p style={labelStyle}>Available Limit</p>
          <h2 style={{ color: "#26c2a3", margin: "5px 0" }}>{0 + (5 - borrowedBooks.length)}</h2>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Max 5 books allowed</span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: `4px solid ${overdueCount > 0 ? "#ef4444" : "#16a34a"}`, padding: "15px" }}>
          <p style={labelStyle}>Overdue Items</p>
          <h2 style={{ color: overdueCount > 0 ? "#ef4444" : "#16a34a", margin: "5px 0" }}>{overdueCount < 10 ? `0${overdueCount}` : overdueCount}</h2>
          <span style={{ fontSize: "11px", color: "#64748b" }}>{overdueCount > 0 ? "⚠️ Fine Pending" : "Clean record"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: "20px" }}>
        
        {/* Left Column: Detailed Library Table (Real Data) */}
        <div>
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ fontSize: "1rem", color: "#1e293b", margin: 0 }}>Currently With You</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#f8fafc", fontSize: "0.85rem", color: "#64748b" }}>
                  <th style={{ padding: "15px" }}>Book Details</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.length > 0 ? borrowedBooks.map((book) => (
                  <tr key={book.id} style={{ borderBottom: "1px solid #f8f9fa" }} className="table-row">
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.95rem" }}>{book.title}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>by {book.author}</div>
                    </td>
                    <td style={{ color: book.isOverdue ? "#ef4444" : "#475569", fontSize: "0.9rem", fontWeight: book.isOverdue ? "700" : "400" }}>
                      {book.dueDate}
                    </td>
                    <td>
                      <span style={{ 
                        padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", 
                        background: book.isOverdue ? "#fef2f2" : "#f0fdf4", 
                        color: book.isOverdue ? "#dc2626" : "#16a34a", 
                        border: `1px solid ${book.isOverdue ? "#fee2e2" : "#dcfce7"}` 
                      }}>
                        {book.isOverdue ? "Overdue" : "Active"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                      No books issued to your account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & News (Untouched UI) */}
        <div>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "15px", fontSize: "1rem" }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button className="lib-action-btn" style={actionBtnStyle}>🔍 Search</button>
              <button className="lib-action-btn" style={actionBtnStyle}>🔄 Renew</button>
              <button className="lib-action-btn" style={actionBtnStyle}>📑 E-Books</button>
              {/* 🟢 Click handler added here */}
              <button onClick={() => setShowRules(true)} className="lib-action-btn" style={actionBtnStyle}>⚙️ Rules</button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "15px", fontSize: "1rem" }}>Library News</h3>
            <div style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc", borderLeft: "4px solid #4a6cf7" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#1e293b" }}>New Semester Stock</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>50+ New Computer Science books added to the central wing.</div>
            </div>
          </div>
        </div>

      </div>

      {/* --- 🟢 LIBRARY RULES MODAL --- */}
      {showRules && (
        <div style={modalOverlay}>
          <div className="card" style={{ width: "450px", padding: "25px", position: "relative", borderTop: "6px solid #4a6cf7" }}>
            <button onClick={() => setShowRules(false)} style={closeBtnStyle}>✕</button>
            <h3 style={{ color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
               <span>📜</span> Central Library Rules
            </h3>
            <ul style={{ padding: "0 0 0 20px", color: "#475569", fontSize: "14px", lineHeight: "1.8" }}>
              <li><strong>Borrowing Limit:</strong> Students can issue up to <strong>5 books</strong> at a time.</li>
              <li><strong>Issue Duration:</strong> Books are issued for a period of <strong>6 days</strong>.</li>
              <li><strong>Overdue Fine:</strong> A fine of <strong>Rs. 10 per day</strong> applies after the due date.</li>
              <li><strong>Re-issue Policy:</strong> Books can be renewed once if not reserved by another student.</li>
              <li><strong>Damage Policy:</strong> Damaged or lost books must be replaced or paid for in full.</li>
              <li><strong>Quiet Zone:</strong> Maintain absolute silence in the reading and central wings.</li>
            </ul>
            <button 
              onClick={() => setShowRules(false)} 
              className="lib-action-btn" 
              style={{ ...actionBtnStyle, width: "100%", marginTop: "20px", background: "#4a6cf7", color: "white", border: "none" }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; padding: 20px; border-radius: 15px; border: 1px solid #eef2f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .table-row:hover { background-color: #fcfdff; }
        
        /* 🟢 NEW: Hover & Active Effects for Buttons */
        .lib-action-btn { transition: all 0.2s ease; }
        .lib-action-btn:hover { 
          background-color: #f1f5f9 !important; 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        /* Style for the Primary button inside Modal */
        .lib-action-btn[style*="background: rgb(74, 108, 247)"]:hover {
          background-color: #3b5bdb !important;
        }
        .lib-action-btn:active { 
          transform: scale(0.96); 
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}

const labelStyle = { fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" };
const actionBtnStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#475569" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const closeBtnStyle = { position: "absolute", top: "10px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" };