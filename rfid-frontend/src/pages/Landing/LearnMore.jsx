import React from "react";
import BackButton from "../../components/BackButton";

export default function LearnMore() {
  return (
    <div style={pageWrapper}>
      <div style={headerSection}>
        <BackButton />
        <h1 style={titleStyle}>How it <span style={{color: "#4f46e5"}}>Works</span></h1>
      </div>

      <div style={contentCard}>
        <div style={stepStyle}>
          <div style={stepNum}>1</div>
          <div>
            <h4 style={{margin: 0}}>Receive Your RFID Card</h4>
            <p style={{color: "#64748b", margin: "5px 0"}}>Visit the admin office to collect your personalized smart ID.</p>
          </div>
        </div>
        
        <div style={stepStyle}>
          <div style={stepNum}>2</div>
          <div>
            <h4 style={{margin: 0}}>Activate Your Portal</h4>
            <p style={{color: "#64748b", margin: "5px 0"}}>Login to the student portal to link your card and top up your wallet.</p>
          </div>
        </div>

        <div style={stepStyle}>
          <div style={stepNum}>3</div>
          <div>
            <h4 style={{margin: 0}}>Tap & Go</h4>
            <p style={{color: "#64748b", margin: "5px 0"}}>Use your card across all campus terminals for seamless access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared styles + Step styles
const pageWrapper = { minHeight: "100vh", background: "#f8fafc", padding: "40px 8%", fontFamily: "'Inter', sans-serif" };
const headerSection = { display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" };
const titleStyle = { fontSize: "2.5rem", fontWeight: "900", color: "#1e293b", margin: 0 };
const contentCard = { background: "white", padding: "40px", borderRadius: "24px", border: "1px solid #e2e8f0" };
const stepStyle = { display: "flex", gap: "20px", marginBottom: "30px", alignItems: "center" };
const stepNum = { background: "#4f46e5", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 };