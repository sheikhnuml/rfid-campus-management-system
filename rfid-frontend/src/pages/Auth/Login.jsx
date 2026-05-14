import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ButtonLoader from "../../components/ButtonLoader"; 
import BackButton from "../../components/BackButton"; 

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setToast({ show: false, message: "", type: "" });
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        username: username,
        password: password
      });

      const user = response.data;
      setToast({ show: true, message: `Welcome back, ${user.name}!`, type: "success" });
      
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      setTimeout(() => {
        const path = user.role === "security" ? "gate" : user.role;
        navigate(`/${path}`);
      }, 1200);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Server connection failed.";
      setToast({ show: true, message: errorMsg, type: "error" });
      setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100vh", width: "100%", background: "radial-gradient(circle at top right, #f8fafc, #e2e8f0)", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 🟢 FIXED: Back Button now navigates to Home "/" on click */}
      <div 
        style={{ position: "absolute", top: "30px", left: "30px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <BackButton />
      </div>

      {/* Toast Message */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          color: "white", padding: "16px 24px", borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex",
          alignItems: "center", gap: "12px", zIndex: 1000
        }}>
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <div>
            <div style={{ fontWeight: "bold" }}>{toast.type === "success" ? "Login Successful" : "Login Failed"}</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>{toast.message}</div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <div style={{ width: "440px", padding: "40px", borderRadius: "24px", backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #4f46e5, #06b6d4)", borderRadius: "15px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "20px" }}>RFID</div>
          <h2 style={{ fontWeight: 800, color: "#1e293b", margin: 0 }}>Portal Login</h2>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>Enter your credentials to access the system</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Username</label>
            <input type="text" placeholder="Enter student ID" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Password</label>
            <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: "100%", padding: "14px", borderRadius: "12px", color: "#fff", border: "none", fontWeight: "700", 
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #6366f1)", 
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
              transition: "0.3s"
            }}
          >
            {loading ? (
              <>
                <ButtonLoader size="18px" />
                <span>Verifying Details...</span>
              </>
            ) : (
              "Sign In to System"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { 
  width: '100%', 
  padding: '12px 16px', 
  borderRadius: '12px', 
  border: '2px solid #e2e8f0', 
  outline: 'none',
  fontSize: '15px',
  transition: '0.2s focus'
};