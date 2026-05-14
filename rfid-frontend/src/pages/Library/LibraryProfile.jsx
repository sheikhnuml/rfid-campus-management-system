import React, { useState, useEffect } from "react";
import axios from "axios";

export default function LibraryProfile() {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassForm, setShowPassForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  // --- STYLES DEFINITION ---
  const avatarStyle = { width: "110px", height: "110px", borderRadius: "30px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "45px", fontWeight: "bold", margin: "0 auto 20px", boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)" };
  const badgeStyle = { background: "#ecfdf5", color: "#065f46", padding: "6px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", border: "1px solid #d1fae5" };
  const sectionTitleStyle = { marginBottom: "25px", fontSize: "1.2rem", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px" };
  const labelStyle = { display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" };
  const valueStyle = { fontSize: "15px", color: "#1e293b", fontWeight: "600", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" };
  const actionBtnStyle = { padding: "12px 24px", borderRadius: "12px", border: "none", background: "#10b981", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "0.3s ease" };
  const inputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "13px" };
  const passFormWrapper = { marginTop: "25px", padding: "20px", background: "#f8fafc", borderRadius: "15px", border: "1px dashed #10b981" };

  useEffect(() => {
    if (loggedInUser) fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const current = res.data.find(u => u._id === loggedInUser._id || u.studentId === loggedInUser.studentId);
      if (current) setManager(current);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) return alert("Please fill all fields.");
    if (newPassword !== confirmPassword) return alert("New passwords do not match!");
    setUpdating(true);
    try {
      const res = await axios.patch(`http://localhost:5000/api/users/change-password/${manager._id}`, { oldPassword, newPassword });
      if (res.data.success) {
        alert("Password updated!");
        setShowPassForm(false);
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating password");
    } finally { setUpdating(false); }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading librarian profile...</div>;
  if (!manager) return <div style={{ padding: "20px" }}>Profile not found.</div>;

  return (
    <div style={{ padding: "10px", fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b", fontWeight: "800" }}>Head Librarian — Profile</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        <div className="card" style={{ textAlign: "center", padding: "40px", borderTop: "4px solid #10b981", background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={avatarStyle}>{manager.name.charAt(0).toUpperCase()}</div>
          <h3 style={{ margin: "10px 0 5px", color: "#1e293b", fontSize: "22px" }}>{manager.name}</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Library ID: {manager.studentId}</p>
          <span style={badgeStyle}>Head Librarian</span>
        </div>
        <div className="card" style={{ padding: "30px", background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={sectionTitleStyle}>Management Account Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
            <div style={{ marginBottom: "15px" }}><label style={labelStyle}>Full Name</label><div style={valueStyle}>{manager.name}</div></div>
            <div style={{ marginBottom: "15px" }}><label style={labelStyle}>Staff Username</label><div style={valueStyle}>{manager.studentId}</div></div>
            <div style={{ marginBottom: "15px" }}><label style={labelStyle}>Account Security</label><div style={valueStyle}><span style={{ color: "#16a34a" }}>●</span> System Verified</div></div>
          </div>
          <div style={{ marginTop: "35px" }}>
            <button onClick={() => setShowPassForm(!showPassForm)} style={actionBtnStyle}>
              {showPassForm ? "Cancel Update" : "Update Password"}
            </button>
          </div>
          {showPassForm && (
            <div style={passFormWrapper}>
              <h4 style={{ fontSize: "14px", color: "#10b981", marginBottom: "15px" }}>Change Librarian Password</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <input type="Text" placeholder="Old" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} style={inputStyle} />
                <input type="Text" placeholder="New" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} style={inputStyle} />
                <input type="Text" placeholder="Confirm" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} style={inputStyle} />
              </div>
              <button onClick={handlePasswordChange} disabled={updating} style={{ ...actionBtnStyle, background: "#1e293b", marginTop: "15px", width: "100%" }}>
                {updating ? "Updating..." : "Save Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const containerStyle = { padding: "10px", animation: "fadeIn 0.5s ease", fontFamily: 'Segoe UI, sans-serif' };
const gridStyle = { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" };
const cardBase = { background: "white", borderRadius: "20px", border: "1px solid #e2e8f0" };
const avatarStyle = { width: "110px", height: "110px", borderRadius: "30px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "45px", fontWeight: "bold", margin: "0 auto 20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" };
const nameTitleStyle = { margin: "10px 0 5px", color: "#1e293b", fontSize: "22px" };
const subTitleStyle = { color: "#64748b", fontSize: "14px", marginBottom: "20px" };
const badgeBase = { padding: "6px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" };
const sectionTitleStyle = { marginBottom: "25px", fontSize: "1.2rem", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px" };
const infoGridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" };
const fieldGroupStyle = { marginBottom: "15px" };
const labelStyle = { display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" };
const valueStyle = { fontSize: "15px", color: "#1e293b", fontWeight: "600", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" };
const actionBtnStyle = { padding: "12px 24px", borderRadius: "12px", border: "none", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "0.3s ease" };
const inputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "13px" };
const passFormWrapper = { marginTop: "25px", padding: "20px", background: "#f8fafc", borderRadius: "15px", animation: "fadeIn 0.3s ease" };
const passInputGrid = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" };