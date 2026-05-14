import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Fetch Real News from DB
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/news");
        setNews(response.data); 
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const role = localStorage.getItem("role");

  return (
    <div style={homeWrapper}>
      {/* 1. NAVIGATION BAR */}
      <nav style={navStyle}>
        <div style={logoGroup}>
          <div style={logoIcon}>RFID</div>
          <span style={logoText}>CAMPUS<span style={{ color: "#4f46e5" }}>ACCESS</span></span>
        </div>
        
        <div style={navLinks}>
          <Link to="/about" style={navLinkItem}>About</Link>
          <Link to="/features" style={navLinkItem}>Features</Link>
          <Link to="/learn-more" style={navLinkItem}>Learn More</Link>
          <Link to={user ? `/${role}` : "/login"} style={portalBtn}>
            {user ? "Open Dashboard" : "Login"}
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <main style={heroSection}>
        <div style={heroContent}>
          <div style={heroLeft}>
            <div style={badgeStyle}></div>
            <h1 style={mainTitle}>RFID-BASED <br /> <span style={{color: "#4f46e5"}}>CARD SYSTEM</span></h1>
            <p style={subTitle}>A unified platform to manage attendance, payments, and library services for students and faculty.</p>
            <div style={actionButtons}>
              <button onClick={() => navigate("/login")} style={btnPrimary}>Get Started</button>
              <button onClick={() => navigate("/learn-more")} style={btnSecondary}>Learn More</button>
            </div>
          </div>

          {/* 🟢 REAL-TIME NEWS CARD (Fix Applied Here) */}
          <div style={heroRight}>
            <div style={newsCard}>
              <div style={newsHeader}>
                <strong style={{color: "#1e293b"}}>📢 Latest Announcements</strong>
                <span style={liveBadge}>LIVE</span>
              </div>
              
              <div style={newsContent}>
                {loading ? (
                  <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '14px'}}>Updating feed...</p>
                ) : news.length > 0 ? (
                  news.map((item, index) => (
                    <div key={index} style={newsItem}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                        <span style={categoryTag}>{item.category || "General"}</span>
                        <span style={newsDate}>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <h4 style={newsTitle}>{item.title}</h4>
                      
                      {/* 🟢 FIXED: Removed substring and added pre-wrap styling */}
                      <p style={{ ...newsDesc, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {item.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '14px'}}>No new announcements today.</p>
                )}
              </div>

              <Link to="/news" style={viewAllLink}>View All Updates →</Link>
            </div>
          </div>
        </div>

        {/* 3. TILES GRID */}
        <div style={tileGrid}>
          <div style={infoTile}>
            <div style={iconCircle}>💳</div>
            <h4 style={tileTitle}>Smart Wallet</h4>
            <p style={tileText}>Instant Cafe Payments</p>
          </div>
          <div style={infoTile}>
            <div style={iconCircle}>🚌</div>
            <h4 style={tileTitle}>Live Tracking</h4>
            <p style={tileText}>Bus Updates</p>
          </div>
          <div style={infoTile}>
            <div style={iconCircle}>📊</div>
            <h4 style={tileTitle}>Analytics</h4>
            <p style={tileText}>Real-time Insights</p>
          </div>
        </div>
      </main>

      <footer style={footerStyle}>
        © {new Date().getFullYear()} RFID-BASED
CARD SYSTEM
      </footer>
    </div>
  );
}

// --- 🟢 ALL STYLE OBJECTS (Preserved Exactly) ---

const homeWrapper = { minHeight: "100vh", background: "#fcfdff", fontFamily: "'Inter', sans-serif", color: "#0f172a" };
const navStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 8%", background: "white", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 100 };
const logoGroup = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon = { background: "#4f46e5", color: "white", padding: "8px 12px", borderRadius: "10px", fontWeight: "900" };
const logoText = { fontWeight: "800", fontSize: "1.2rem", letterSpacing: "-0.5px" };
const navLinks = { display: "flex", alignItems: "center", gap: "25px" };
const navLinkItem = { textDecoration: "none", color: "#64748b", fontWeight: "600", fontSize: "14px" };
const portalBtn = { background: "#4f46e5", color: "white", padding: "10px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "14px" };
const heroSection = { padding: "60px 8%" };
const heroContent = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "60px" };
const heroLeft = { flex: 1.2 };
const heroRight = { flex: 1, display: "flex", justifyContent: "flex-end" };
const badgeStyle = { color: "#4f46e5", fontWeight: "800", fontSize: "12px", letterSpacing: "1px", marginBottom: "15px" };
const mainTitle = { fontSize: "3.5rem", fontWeight: "900", margin: "0 0 20px 0", lineHeight: 1.1 };
const subTitle = { fontSize: "1.1rem", color: "#64748b", lineHeight: "1.6", marginBottom: "35px" };
const actionButtons = { display: "flex", gap: "15px" };
const btnPrimary = { background: "#1e293b", color: "white", border: "none", padding: "16px 35px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" };
const btnSecondary = { background: "white", border: "1px solid #e2e8f0", padding: "16px 35px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "#475569" };
const newsCard = { width: "100%", maxWidth: "420px", background: "white", borderRadius: "28px", border: "1px solid #f1f5f9", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.06)", overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const newsHeader = { padding: "20px 25px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: '#f8fafc' };
const liveBadge = { background: "#ef4444", color: "white", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: "800" };
const newsContent = { padding: "20px 25px", maxHeight: "320px", overflowY: "auto" };
const newsItem = { marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid #f8fafc" };
const categoryTag = { fontSize: "10px", fontWeight: "700", color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" };
const newsDate = { fontSize: "11px", color: "#94a3b8" };
const newsTitle = { fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "8px 0 4px 0" };
const newsDesc = { fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" };
const viewAllLink = { padding: "15px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#4f46e5", textDecoration: "none", borderTop: "1px solid #f1f5f9", transition: '0.2s' };
const tileGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px", marginTop: "100px" };
const infoTile = { background: "white", padding: "40px 20px", borderRadius: "24px", border: "1px solid #f1f5f9", textAlign: "center" };
const iconCircle = { fontSize: "32px", marginBottom: "15px" };
const tileTitle = { margin: "0 0 5px 0", color: "#1e293b" };
const tileText = { color: "#94a3b8", fontSize: "13px" };
const footerStyle = { textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "13px", marginTop: "80px", borderTop: "1px solid #f1f5f9" };