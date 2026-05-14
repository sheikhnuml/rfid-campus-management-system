import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 🟢 NEW STATES FOR PASSWORD FEATURE ---
  const [showPassForm, setShowPassForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (loggedInUser) {
      fetchAdminData();
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const currentAdmin = res.data.find(u => u._id === loggedInUser._id || u.studentId === loggedInUser.studentId);
      if (currentAdmin) setAdmin(currentAdmin);
      setLoading(false);
    } catch (err) {
      console.error("Admin Profile fetch error:", err);
      setLoading(false);
    }
  };

  // --- 🟢 PASSWORD UPDATE LOGIC ---
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.patch(`http://localhost:5000/api/users/change-password/${admin._id}`, {
        oldPassword,
        newPassword
      });

      if (res.data.success) {
        alert("Password updated successfully!");
        setShowPassForm(false);
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating password");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading admin profile...</div>;
  if (!admin) return <div style={{ padding: "20px" }}>Admin data not found.</div>;

  return (
    <div style={{ padding: "10px", animation: "fadeIn 0.5s ease", fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b", fontWeight: "800" }}>Admin Profile — Control Center</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        
        {/* Left Column: Avatar */}
        <div className="card" style={{ textAlign: "center", padding: "40px", borderTop: "4px solid #4f46e5" }}>
          <div style={avatarStyle}>{admin.name.charAt(0).toUpperCase()}</div>
          <h3 style={{ margin: "10px 0 5px", color: "#1e293b", fontSize: "22px" }}>{admin.name}</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Admin ID: {admin.studentId}</p>
          <span style={badgeStyle}>System Administrator</span>
        </div>

        {/* Right Column: Account Details */}
        <div className="card" style={{ padding: "30px" }}>
          <h3 style={sectionTitleStyle}>Management Account Details</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
            <div style={fieldGroupStyle}><label style={labelStyle}>Full Admin Name</label><div style={valueStyle}>{admin.name}</div></div>
            <div style={fieldGroupStyle}><label style={labelStyle}>Access Username</label><div style={valueStyle}>{admin.studentId}</div></div>
            {/* <div style={fieldGroupStyle}><label style={labelStyle}>Department Authority</label><div style={valueStyle}>{admin.department || "Administration"}</div></div> */}
            <div style={fieldGroupStyle}><label style={labelStyle}>Account Security</label><div style={valueStyle}><span style={{ color: "#16a34a" }}>●</span> Encrypted & Active</div></div>
          </div>

          <div style={{ marginTop: "35px", display: "flex", gap: "15px" }}>
            {/* ✅ FIXED: Toggle Button */}
            <button onClick={() => setShowPassForm(!showPassForm)} style={actionBtnStyle}>
              {showPassForm ? "Cancel Update" : "Change password"}
            </button>
            {/* <button style={{ ...actionBtnStyle, background: "#f8fafc", color: "#1e293b", border: "1px solid #e2e8f0" }}>
              View System Logs
            </button> */}
          </div>

          {/* --- 🟢 HIDDEN PASSWORD FORM --- */}
          {showPassForm && (
            <div style={passFormWrapper}>
              <h4 style={{ fontSize: "14px", color: "#4f46e5", marginBottom: "15px" }}>Change Admin Password</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <input type="text" placeholder="Old Password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Confirm" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} style={inputStyle} />
              </div>
              <button onClick={handlePasswordChange} disabled={updating} style={{ ...actionBtnStyle, marginTop: "15px", width: "100%" }}>
                {updating ? "Updating..." : "Save New Password"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const avatarStyle = { width: "110px", height: "110px", borderRadius: "30px", background: "linear-gradient(135deg, #4f46e5, #818cf8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "45px", fontWeight: "bold", margin: "0 auto 20px", boxShadow: "0 10px 25px rgba(79, 70, 229, 0.2)" };
const badgeStyle = { background: "#fdf2f2", color: "#ef4444", padding: "6px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", border: "1px solid #fee2e2" };
const sectionTitleStyle = { marginBottom: "25px", fontSize: "1.2rem", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px" };
const fieldGroupStyle = { marginBottom: "15px" };
const labelStyle = { display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" };
const valueStyle = { fontSize: "15px", color: "#1e293b", fontWeight: "600", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" };
const actionBtnStyle = { padding: "12px 24px", borderRadius: "12px", border: "none", background: "#4f46e5", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "0.3s ease" };
const inputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "13px" };
const passFormWrapper = { marginTop: "25px", padding: "20px", background: "#f8fafc", borderRadius: "15px", border: "1px dashed #4f46e5", animation: "fadeIn 0.3s ease" };