import React from "react";

export default function ButtonLoader({ size = "20px", color = "#ffffff" }) {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `3px solid rgba(255,255,255,0.3)`,
    borderTop: `3px solid ${color}`,
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite" 
  };

  return <div style={spinnerStyle}></div>;
}