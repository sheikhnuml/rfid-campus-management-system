import React, { useState, useEffect } from "react";
import axios from "axios";
import ButtonLoader from "../../components/ButtonLoader";
// 🟢 Socket Client Import
import io from "socket.io-client";

// 🟢 Automatic Detection Logic
const SERVER_IP = window.location.hostname; // Ye khud hi laptop ki current IP utha lega
const BASE_URL = `http://${SERVER_IP}:5000`;

// Ab isi BASE_URL ko socket aur axios mein use karein
const socket = io(BASE_URL);

export default function Library() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingIssue, setLoadingIssue] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newQty, setNewQty] = useState(1);

  const [issueTarget, setIssueTarget] = useState(null);
  const [issueUser, setIssueUser] = useState("");
  
  // 🟢 State for RFID
  const [scannedRfid, setScannedRfid] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  // 🟢 Socket Listener for Card Tapping
  useEffect(() => {
    const handleCapturedTag = (tag) => {
      if (issueTarget) {
        setScannedRfid(tag);
        setIssueUser("CARD DETECTED"); 
        console.log("Student Card Detected:", tag);
      }
    };

    socket.on("new-rfid-captured", handleCapturedTag);
    socket.on("library-tag-captured", handleCapturedTag); // Added for safety
    socket.on("rfid-collision", (data) => handleCapturedTag(data.tag));

    return () => {
      socket.off("new-rfid-captured");
      socket.off("library-tag-captured");
      socket.off("rfid-collision");
    };
  }, [issueTarget]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/library/books`);
      setBooks(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Library fetch error", err);
      setLoading(false);
    }
  };

  // 🟢 NEW: Activate/Deactivate Terminal Mode
  const setTerminalIssueMode = async (status) => {
    try {
      await axios.post(`${BASE_URL}/api/library/set-issue-mode`, { active: status });
    } catch (err) {
      console.error("Mode set error", err);
    }
  };

  const openIssueModal = (book) => {
    setIssueTarget(book);
    setIssueUser("");
    setScannedRfid("");
    setTerminalIssueMode(true); // 🚀 Open the gate for the Terminal
  };

  const closeIssueModal = () => {
    setIssueTarget(null);
    setTerminalIssueMode(false); // 🚀 Close the gate
  };

  const totalStockInLibrary = books.reduce((acc, b) => acc + (b.totalStock || 0), 0);
  const totalIssuedBooks = books.reduce((acc, b) => acc + (b.issuedTo?.length || 0), 0);
  const totalAvailableBooks = totalStockInLibrary - totalIssuedBooks;

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddStock(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoadingStock(true);
    try {
      await axios.post(`${BASE_URL}/api/library/add`, {
        title: newTitle,
        author: newAuthor || "Unknown Author",
        totalStock: Number(newQty)
      });
      setNewTitle(""); setNewAuthor(""); setNewQty(1);
      fetchBooks(); 
    } catch (err) { alert("Error updating stock"); }
    finally { setLoadingStock(false); }
  }

  async function confirmIssue() {
    if (!issueUser.trim() && !scannedRfid) return;
    setLoadingIssue(true);
    try {
      const res = await axios.patch(`${BASE_URL}/api/library/issue`, {
        bookId: issueTarget._id,
        studentId: issueUser !== "CARD DETECTED" ? issueUser.trim().toUpperCase() : undefined,
        rfidTag: scannedRfid || undefined
      });
      alert(res.data.message || "Book Issued!");
      closeIssueModal(); // Automatically disarms terminal
      fetchBooks(); 
    } catch (err) { alert(err.response?.data?.message || "Error issuing book."); }
    finally { setLoadingIssue(false); }
  }

  async function returnBook(bookId, studentId) {
    if(!window.confirm(`Confirm return for ${studentId}?`)) return;
    try {
      await axios.patch(`${BASE_URL}/api/library/return`, { bookId, studentId });
      fetchBooks(); 
    } catch (err) { alert("Return failed."); }
  }

  if (loading) return <div style={{ padding: "20px" }}>Loading Library Records...</div>;

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ color: "#1e293b", fontWeight: "800", marginBottom: "20px" }}>📚 Library Management System</h2>

      {/* ANALYTICS SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="card" style={statCardStyle("#4f46e5")}>
          <div style={iconCircleStyle}>📖</div>
          <div><p style={cardLabelStyle}>Total Inventory</p><h2 style={cardValueStyle}>{totalStockInLibrary}</h2></div>
        </div>
        <div className="card" style={statCardStyle("#ef4444")}>
          <div style={iconCircleStyle}>📤</div>
          <div><p style={cardLabelStyle}>Currently Issued</p><h2 style={cardValueStyle}>{totalIssuedBooks}</h2></div>
        </div>
        <div className="card" style={statCardStyle("#10b981")}>
          <div style={iconCircleStyle}>✅</div>
          <div><p style={cardLabelStyle}>Available on Shelf</p><h2 style={cardValueStyle}>{totalAvailableBooks}</h2></div>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="card" style={{ padding: "10px 20px", marginBottom: "25px", background: "#fff", borderRadius: "15px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px" }}>🔍</span>
        <input type="text" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "12px", border: "none", outline: "none", fontSize: "16px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "25px" }}>
        {/* ADD STOCK FORM */}
        <div className="card" style={{ padding: "25px", background: "#fff", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", height: "fit-content" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "16px", color: "#1e293b" }}>📦 Add New Stock</h3>
          <form onSubmit={handleAddStock} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input style={inputStyle} placeholder="Book Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            <input style={inputStyle} placeholder="Author" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
            <input style={inputStyle} type="number" min="1" value={newQty} onChange={(e) => setNewQty(e.target.value)} />
            <button style={mainBtnStyle} type="submit" disabled={loadingStock}>
              {loadingStock ? <ButtonLoader size="16px" /> : "Update Inventory"}
            </button>
          </form>
        </div>

        {/* INVENTORY TABLE */}
        <div className="card" style={{ padding: "0", background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr style={{ textAlign: "left" }}>
                <th style={thStyle}>Book Information</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Issued To & Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(b => {
                const available = (b.totalStock || 0) - (b.issuedTo?.length || 0);
                return (
                  <tr key={b._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>{b.title}</div>
                      <div style={{ color: "#64748b", fontSize: "12px" }}>{b.author}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "800", color: available > 0 ? "#10b981" : "#ef4444" }}>{available}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                        {b.issuedTo?.map((issue, idx) => (
                          <div key={idx} style={issueTagStyle}>
                            <div style={{flex: 1}}>
                              <div style={{fontWeight: "700", fontSize: "12px"}}>👤 {issue.studentId}</div>
                              <div style={{fontSize: "10px", color: "#ef4444"}}>📅 Due: {new Date(issue.returnDate).toLocaleDateString()}</div>
                            </div>
                            <button onClick={() => returnBook(b._id, issue.studentId)} style={returnBtnStyle}>Return</button>
                          </div>
                        ))}
                      </div>
                      <button 
                        style={available === 0 ? disabledBtn : actionBtnStyle} 
                        disabled={available === 0} 
                        onClick={() => openIssueModal(b)}
                      >
                        {available === 0 ? "Out of Stock" : "+ Issue Copy"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISSUE MODAL */}
      {issueTarget && (
        <div style={modalOverlayStyle}>
          <div className="card" style={{ width: "350px", padding: "30px", textAlign: "center", borderRadius: "20px" }}>
            <h3 style={{margin: 0}}>Issue Book</h3>
            <p style={{ color: "#4f46e5", fontWeight: "bold" }}>{issueTarget.title}</p>
            <input 
              style={modalInputStyle} 
              placeholder="Student ID or Tap Card" 
              value={issueUser} 
              onChange={e => { setIssueUser(e.target.value); setScannedRfid(""); }} 
              autoFocus 
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ ...mainBtnStyle, flex: 1 }} onClick={confirmIssue} disabled={loadingIssue}>
                {loadingIssue ? <ButtonLoader size="16px" /> : "Confirm"}
              </button>
              <button style={{ ...mainBtnStyle, background: "#64748b", flex: 1 }} onClick={closeIssueModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES (Preserved)
const statCardStyle = (color) => ({ background: "#fff", padding: "20px", borderRadius: "20px", borderLeft: `6px solid ${color}`, display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" });
const iconCircleStyle = { width: "45px", height: "45px", background: "#f1f5f9", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const cardLabelStyle = { margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" };
const cardValueStyle = { margin: 0, color: "#1e293b", fontSize: "24px", fontWeight: "800" };
const inputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" };
const modalInputStyle = { ...inputStyle, width: "100%", textAlign: "center", margin: "15px 0", fontSize: "18px", border: "2px solid #4f46e5", boxSizing: "border-box" };
const mainBtnStyle = { padding: "12px", background: "#1e293b", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" };
const thStyle = { padding: "15px 20px", fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" };
const tdStyle = { padding: "15px 20px", verticalAlign: "top" };
const issueTagStyle = { display: "flex", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" };
const returnBtnStyle = { background: "none", border: "none", color: "#4f46e5", fontWeight: "bold", fontSize: "11px", cursor: "pointer", textDecoration: "underline" };
const actionBtnStyle = { background: "#4f46e5", color: "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700" };
const disabledBtn = { ...actionBtnStyle, background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };