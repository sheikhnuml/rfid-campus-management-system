import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentTimetable() {
  const [mySchedules, setMySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, nextClass: "N/A", day: "" });

  // 1. Get Logged-in User from LocalStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.studentId) {
      fetchAndFilterTimetable();
    }
  }, []);

  const fetchAndFilterTimetable = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/timetable");
      const allSchedules = res.data;

      // 2. DYNAMIC FILTER: STUDENT SHOWS THERE RESPECTIVE SUBJECTIVE
      const filtered = allSchedules.filter(slot => 
        user.subjects && user.subjects.some(sub => sub.toLowerCase() === slot.subject.toLowerCase())
      );

      // Sort by Time
      filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

      setMySchedules(filtered);

      // 3. Dynamic Stats Calculation
      if (filtered.length > 0) {
        setStats({
          total: filtered.length,
          nextClass: filtered[0].startTime,
          day: filtered[0].day
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Syncing your schedule...</div>;

  return (
    <div style={{ padding: "10px", animation: "fadeIn 0.5s ease", fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h2 className="admin-title" style={{ marginBottom: "20px", color: "#1e293b" }}>
        Academic Timetable — {user.name}'s Schedule
      </h2>

      {/* 1. DYNAMIC SUMMARY ROW */}
      <div className="dash-grid-3" style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #4a6cf7" }}>
          <p style={labelStyle}>Registered Classes</p>
          <h2 style={{ color: "#4a6cf7", margin: "5px 0" }}>{stats.total < 10 ? `0${stats.total}` : stats.total}</h2>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Based on your courses</span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #26c2a3" }}>
          <p style={labelStyle}>Earliest Class</p>
          <h2 style={{ color: "#26c2a3", margin: "5px 0" }}>{stats.nextClass}</h2>
          <span style={{ fontSize: "11px", color: "#16a34a" }}>● {stats.day || "Today"}</span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center", borderTop: "4px solid #6b81ff" }}>
          <p style={labelStyle}>Campus Status</p>
          <h2 style={{ color: "#6b81ff", margin: "5px 0" }}>Open</h2>
          <span style={{ fontSize: "11px", color: "#64748b" }}>RFID Active Access</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: "20px" }}>
        
        {/* Left Column: Real Database Table */}
        <div>
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: "1rem", color: "#1e293b", margin: 0 }}>Class Detailed List</h3>
              <span style={{fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '5px'}}>Real-time Sync ✅</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#f8fafc", fontSize: "0.85rem", color: "#64748b" }}>
                  <th style={{ padding: "15px" }}>Subject & Teacher</th>
                  <th>Day & Time</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {mySchedules.length > 0 ? mySchedules.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8f9fa" }} className="table-row">
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.95rem", textTransform: 'capitalize' }}>{t.subject}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.teacher}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#475569", fontSize: "0.9rem" }}>{t.day}</div>
                      <div style={{ fontSize: "12px", color: "#4a6cf7" }}>{t.startTime} - {t.endTime}</div>
                    </td>
                    <td>
                      <span style={roomBadgeStyle}>Room {t.room}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
                      No classes found for your registered subjects.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Today's Focus & Quick Actions */}
        <div>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "15px", fontSize: "1rem" }}>Status & Focus</h3>
            <div style={{ padding: "15px", borderRadius: "12px", background: "#f0fdf4", borderLeft: "4px solid #16a34a" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#1e293b" }}>RFID Access Enabled</div>
              <div style={{ fontSize: "12px", color: "#16a34a" }}>Your card is authorized for all scheduled rooms.</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "15px", fontSize: "1rem" }}>Student Tools</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button style={actionBtnStyle}>📄 Syllabus</button>
              <button style={actionBtnStyle}>📅 Calendar</button>
              <button style={actionBtnStyle}>📝 Exams</button>
              <button style={actionBtnStyle}>⚙️ Support</button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; padding: 20px; border-radius: 15px; border: 1px solid #eef2f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .table-row:hover { background-color: #fcfdff; }
      `}</style>
    </div>
  );
}

// Internal Styles
const labelStyle = { fontSize: "13px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" };
const actionBtnStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#475569" };
const roomBadgeStyle = { padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", background: "#f0f2ff", color: "#4a6cf7", border: "1px solid #e0e7ff" };