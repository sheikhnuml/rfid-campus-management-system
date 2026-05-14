import React from "react";
import BackButton from "../../components/BackButton";

export default function Features() {
  const featureList = [
    { icon: "📝", title: "Smart Attendance", desc: "Instant RFID-based classroom check-ins." },
    { icon: "🚌", title: "Transport Monitoring", desc: "Real-time boarding." },
    { icon: "💳", title: "Cashless Cafe", desc: "Digital wallet for secure and fast food payments." },
    { icon: "🛡️", title: "Gate Monitoring", desc: "Check IN " },
    { icon: "📚", title: "Library Terminal", desc: "Seamless book issuance and return system." }
  ];

  return (
    <div style={pageWrapper}>
      <div style={headerSection}>
        <BackButton />
        <h1 style={titleStyle}>System <span style={{color: "#0d9488"}}>Features</span></h1>
      </div>

      <div style={gridStyle}>
        {featureList.map((f, i) => (
          <div key={i} style={featureCard}>
            <div style={{fontSize: "40px", marginBottom: "15px"}}>{f.icon}</div>
            <h3 style={{color: "#1e293b", marginBottom: "10px"}}>{f.title}</h3>
            <p style={{color: "#64748b", fontSize: "14px"}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Existing styles + Grid
const pageWrapper = { minHeight: "100vh", background: "#f8fafc", padding: "40px 8%", fontFamily: "'Inter', sans-serif" };
const headerSection = { display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" };
const titleStyle = { fontSize: "2.5rem", fontWeight: "900", color: "#1e293b", margin: 0 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" };
const featureCard = { background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "center", transition: "0.3s" };