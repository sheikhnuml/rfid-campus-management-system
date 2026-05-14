import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminNews() {
  const [newsList, setNewsList] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", category: "General" });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // 🟢 1. Fetch News from DB
  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/news");
      setNewsList(res.data);
    } catch (err) {
      console.error("Error fetching news");
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // 🔵 2. Handle Post or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // Update Logic
        await axios.put(`http://localhost:5000/api/admin/news/${currentId}`, formData);
        alert("News Updated!");
      } else {
        // Create Logic
        await axios.post("http://localhost:5000/api/admin/news", formData);
        alert("News Posted!");
      }
      setFormData({ title: "", description: "", category: "General" });
      setIsEditing(false);
      fetchNews(); // Refresh Table
    } catch (err) {
      alert("Action failed!");
    } finally {
      setLoading(false);
    }
  };

  // 🟡 3. Prepare Edit
  const handleEdit = (item) => {
    setFormData({ title: item.title, description: item.description, category: item.category });
    setCurrentId(item._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  // 🔴 4. Delete News
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/news/${id}`);
        fetchNews();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div style={{ padding: "30px", animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>📢 Campus News Management</h2>

      {/* --- FORM SECTION --- */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#4f46e5" }}>
          {isEditing ? "✏️ Edit News Entry" : "➕ Post New Announcement"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={labelStyle}>News Title</label>
              <input 
                style={inputStyle} 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select 
                style={inputStyle} 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="General">General</option>
                <option value="Exams">Exams</option>
                <option value="Transport">Transport</option>
                <option value="Cafe">Cafe</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Description</label>
            <textarea 
              style={{ ...inputStyle, height: "80px" }} 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              required 
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={btnStyle} disabled={loading}>
              {loading ? "Processing..." : isEditing ? "Update News" : "Post News"}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); setFormData({title: "", description: "", category: "General"}); }}
                style={{ ...btnStyle, background: "#64748b" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- TABLE SECTION --- */}
      <div style={{ ...cardStyle, marginTop: "30px", padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <h3 style={{ fontSize: "16px", margin: 0 }}>Posted Announcements</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((item) => (
                <tr key={item._id} style={trStyle}>
                  <td style={tdStyle}>
                    {new Date(item.date).toLocaleDateString()} <br/>
                    <small style={{ color: "#94a3b8" }}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </td>
                  <td style={tdStyle}><span style={badgeStyle(item.category)}>{item.category}</span></td>
                  <td style={tdStyle}><strong>{item.title}</strong></td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(item)} style={actionBtn("#4f46e5")}>Edit</button>
                    <button onClick={() => handleDelete(item._id)} style={actionBtn("#ef4444")}>Delete</button>
                  </td>
                </tr>
              ))}
              {newsList.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No news posted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const cardStyle = { background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", marginTop: "5px", fontSize: "14px", outline: "none" };
const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#64748b" };
const btnStyle = { background: "#4f46e5", color: "white", padding: "12px 25px", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", transition: "0.3s" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { padding: "15px 20px", fontSize: "13px", color: "#64748b", fontWeight: "600" };
const tdStyle = { padding: "15px 20px", fontSize: "14px", borderTop: "1px solid #f1f5f9" };
const trStyle = { transition: "0.2s" };
const actionBtn = (color) => ({ background: "transparent", border: `1px solid ${color}`, color: color, padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginRight: "8px" });
const badgeStyle = (cat) => ({
  padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
  background: cat === "Exams" ? "#fff1f2" : cat === "Transport" ? "#f0f9ff" : "#f0fdf4",
  color: cat === "Exams" ? "#e11d48" : cat === "Transport" ? "#0369a1" : "#166534"
});