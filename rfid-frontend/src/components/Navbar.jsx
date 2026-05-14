// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";

export default function Navbar({ title }) {
  const [dark, setDark] = useState(localStorage.getItem("dark") === "true");

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("dark", dark);
  }, [dark]);

  // const username = localStorage.getItem("username") || "U";

  return (
    <div className="topbar">
      <div className="title">{title}</div>

      <div className="actions">
        {/* <button
          className="btn small alt"
          onClick={() => setDark(!dark)}
        >
          {dark ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button> */}

        {/* <div className="avatar">{username[0].toUpperCase()}</div> */}
      </div>
    </div>
  );
}
