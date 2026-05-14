import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 🟢 NEW STATES FOR PASSWORD FEATURE ---
  const [showPassForm, setShowPassForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (loggedInUser && loggedInUser.studentId) {
      fetchLatestProfile();
    }
  }, []);

  const fetchLatestProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const currentStudent = res.data.find(u => u.studentId === loggedInUser.studentId);
      
      if (currentStudent) {
        setStudent(currentStudent);
      }
      setLoading(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setLoading(false);
    }
  };

  // --- 🟢 PASSWORD UPDATE LOGIC ---
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.patch(`http://localhost:5000/api/users/change-password/${student._id}`, {
        oldPassword,
        newPassword
      });

      if (res.data.success) {
        alert("Password updated successfully!");
        setShowPassForm(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating password");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading profile details...</div>;
  if (!student) return <div style={{ padding: "20px" }}>User not found.</div>;

  return (
    <div style={{ padding: "10px", animation: "fadeIn 0.5s ease", fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h2 className="admin-title" style={{ marginBottom: "20px", color: "#1e293b" }}>Your Profile — Personal Information</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="card" style={{ textAlign: "center", padding: "30px", borderTop: "4px solid #4a6cf7" }}>
          <div style={{ 
            width: "100px", height: "100px", borderRadius: "20px", 
            background: "linear-gradient(135deg, #4a6cf7, #6b81ff)", 
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "40px", fontWeight: "bold", margin: "0 auto 15px",
            boxShadow: "0 10px 20px rgba(74, 108, 247, 0.2)"
          }}>
            {student.name.charAt(0)}
          </div>
          <h3 style={{ margin: "10px 0 5px", color: "#1e293b" }}>{student.name}</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 15px" }}>@{student.studentId}</p>
          <span style={{ 
            background: "#eef2ff", color: "#4a6cf7", padding: "5px 15px", 
            borderRadius: "20px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase"
          }}>
            {student.role} portal
          </span>
        </div>

        {/* Right Column: Account Details */}
        <div className="card" style={{ padding: "25px" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.1rem", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
            Account Details
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={fieldGroupStyle}><label style={labelStyle}>Full Name</label><div style={valueStyle}>{student.name}</div></div>
            <div style={fieldGroupStyle}><label style={labelStyle}>Student ID</label><div style={valueStyle}>{student.studentId}</div></div>
            <div style={fieldGroupStyle}><label style={labelStyle}>Official Email</label><div style={valueStyle}>{student.email || `${student.studentId.toLowerCase()}@numl.edu.pk`}</div></div>
            <div style={fieldGroupStyle}><label style={labelStyle}>System Status</label><div style={valueStyle}><span style={{ color: student.status === "blocked" ? "#ef4444" : "#16a34a" }}>●</span> {student.status === "blocked" ? " Restricted" : " Authorized"}</div></div>
            <div style={fieldGroupStyle}><label style={labelStyle}>RFID Tag Status</label><div style={valueStyle}><span style={{ color: student.rfidTag ? "#16a34a" : "#94a3b8" }}>●</span> {student.rfidTag ? " Active & Linked" : " Not Assigned"}</div></div>
            <div style={fieldGroupStyle}><label style={labelStyle}>Department</label><div style={valueStyle}>{student.department || "Not Assigned"}</div></div>
          </div>

          <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
            {/* ✅ FIXED: Toggle Password Form */}
            <button onClick={() => setShowPassForm(!showPassForm)} style={actionBtnStyle}>
              {showPassForm ? "Cancel Update" : "Change Password"}
            </button>
            {/* <button style={{ ...actionBtnStyle, background: "#f8fafc", color: "#1e293b" }}>Request ID Update</button> */}
          </div>

          {/* --- 🟢 PASSWORD CHANGE FORM (CONDITIONAL RENDERING) --- */}
          {showPassForm && (
            <div style={{ marginTop: "25px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #4a6cf7", animation: "fadeIn 0.3s ease" }}>
              <h4 style={{ fontSize: "14px", color: "#4a6cf7", marginBottom: "15px" }}>Update Security Password</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <input type="text" placeholder="Old Password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Confirm Password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} style={inputStyle} />
              </div>
              <button onClick={handlePasswordChange} disabled={updating} style={{ ...actionBtnStyle, marginTop: "15px", width: "100%" }}>
                {updating ? "Processing..." : "Confirm & Update Password"}
              </button>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; border-radius: 15px; border: 1px solid #eef2f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      `}</style>
    </div>
  );
}

// Styles Preserved
const fieldGroupStyle = { marginBottom: "15px" };
const labelStyle = { display: "block", fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" };
const valueStyle = { fontSize: "15px", color: "#1e293b", fontWeight: "600", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" };
const actionBtnStyle = { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#4a6cf7", color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer", transition: "0.2s" };
const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none", fontSize: "13px" };