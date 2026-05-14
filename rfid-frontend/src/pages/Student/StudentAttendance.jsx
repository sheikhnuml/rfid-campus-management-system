import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState("days"); 

  const user = JSON.parse(localStorage.getItem("user"));
  
  // 🟢 Optimization: AFTER 5 SEC
  const syncInterval = useRef(null);

  useEffect(() => {
    if (user && user.studentId) {
      
      fetchAndProcessData(true);

      syncInterval.current = setInterval(() => {
        fetchAndProcessData(false); // Background update
      }, 5000);
    }

    // Cleanup interval when leaving the page
    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, []);

  const fetchAndProcessData = async (isInitial) => {
    try {
      if (isInitial) setLoading(true);

      const userRes = await axios.get(`http://localhost:5000/api/users`);
      const profile = userRes.data.find(u => u.studentId === user.studentId);
      const mySubjects = profile?.subjects || [];

      const res = await axios.get("http://localhost:5000/api/attendance");
      const myLogs = res.data.filter(l => l.userId?.studentId === user.studentId);

      const colors = ["#4a6cf7", "#26c2a3", "#ef4444", "#6b81ff", "#f59e0b"];

      const processed = mySubjects.map((sub, index) => {
        const subLogs = myLogs.filter(l => l.subject === sub);
        
        const daysView = subLogs.map(l => ({
          date: new Date(l.createdAt).toLocaleDateString("en-PK", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          status: l.status.toUpperCase(),
          time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));

        const weeksView = [1, 2, 3, 4].map(w => ({
          week: `Week ${w}`,
          present: subLogs.filter(l => {
            const date = new Date(l.createdAt);
            const now = new Date();
            const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
            return diffDays > (w - 1) * 7 && diffDays <= w * 7;
          }).length
        }));

        const monthsView = ["Jan", "Feb", "Mar", "Apr"].map(m => ({
          month: m,
          present: subLogs.filter(l => new Date(l.createdAt).toLocaleString('en-us', { month: 'short' }) === m).length
        }));

        const takenSessions = subLogs.length; 
        const totalPoints = takenSessions * 2; 
        const maxPoints = 30 * 2; 
        const attendancePercentage = ((takenSessions / 30) * 100).toFixed(1);

        return {
          id: index + 1,
          subject: sub,
          conducted: 30,
          present: takenSessions,
          absent: 30 - takenSessions,
          color: colors[index % colors.length],
          days: daysView,
          weeks: weeksView,
          months: monthsView,
          summary: {
            taken: takenSessions,
            points: `${totalPoints} / ${maxPoints}`,
            percent: attendancePercentage
          }
        };
      });

      setAttendanceData(processed);

      // 🟢 Optimization: Agar koi subject select hua wa hai, toh uska data bhi live update karo
      if (selectedSubject) {
        const updatedSelected = processed.find(p => p.subject === selectedSubject.subject);
        if (updatedSelected) setSelectedSubject(updatedSelected);
      }

      if (isInitial) setLoading(false);
    } catch (err) {
      console.error(err);
      if (isInitial) setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Analyzing Attendance History...</div>;

  return (
    <div style={{ padding: "10px", animation: "fadeIn 0.5s ease" }}>
      <h2 className="admin-title">Attendance Insights <span style={{fontSize: '10px', color: '#10b981', verticalAlign: 'middle'}}>● Live Sync</span></h2>

      {/* SUBJECTS TABLE */}
      <div className="card" style={{ marginBottom: "20px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eee", fontSize: "0.9rem", color: "#666" }}>
              <th style={{ padding: "12px" }}>Subject</th>
              <th>Lectures</th>
              <th>P / A</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((item) => {
              const percentage = Math.round((item.present / item.conducted) * 100);
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                  <td style={{ padding: "15px 12px", fontWeight: "600" }}>{item.subject}</td>
                  <td>{item.conducted}</td>
                  <td><span style={{ color: "#16a34a" }}>{item.present}</span> / <span style={{ color: "#dc2626" }}>{item.absent}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "60px", height: "6px", background: "#eee", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ width: `${percentage}%`, height: "100%", background: item.color }} />
                      </div>
                      <span style={{ fontWeight: "700" }}>{percentage}%</span>
                    </div>
                  </td>
                  <td><span style={statusBadgeStyle(percentage < 75)}>{percentage < 75 ? "Short" : "Normal"}</span></td>
                  <td><button className="btn small alt" onClick={() => setSelectedSubject(item)}>Details</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- TIME-BASED DETAILS SECTION --- */}
      {selectedSubject && (
        <div className="card" style={{ borderLeft: `6px solid ${selectedSubject.color}`, animation: "slideIn 0.3s ease", padding: "20px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "20px" }}>
            <h3 style={{ margin: 0 }}>📊 Analytics: {selectedSubject.subject}</h3>
            <button onClick={() => setSelectedSubject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: "18px" }}>✕</button>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {['days', 'weeks', 'months'].map(t => (
              <button key={t} onClick={() => setDetailTab(t)} style={tabBtnStyle(detailTab === t, selectedSubject.color)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "12px" }}>
            {detailTab === 'days' && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                {selectedSubject.days.length > 0 ? selectedSubject.days.map((d, i) => (
                  <div key={i} style={{ ...miniCardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{d.date}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Class Session Attendance</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "800", color: "#16a34a", fontSize: "12px" }}>{d.status}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Marked at {d.time}</div>
                    </div>
                  </div>
                )) : <p style={{textAlign: 'center', color: '#94a3b8'}}>No logs found for this subject.</p>}
              </div>
            )}

            {detailTab === 'weeks' && (
              <div style={{ display: "flex", gap: "15px" }}>
                {selectedSubject.weeks.map((w, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: "40px", width: "100%", background: "#e2e8f0", borderRadius: "4px", position: "relative" }}>
                       <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${(w.present / 5) * 100}%`, background: selectedSubject.color, borderRadius: "4px" }}></div>
                    </div>
                    <div style={{ fontSize: "10px", marginTop: "5px", fontWeight: "bold" }}>{w.week}</div>
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'months' && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {selectedSubject.months.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#fff", borderRadius: "8px", border: "1px solid #eef2f6" }}>
                    <span style={{ fontWeight: "600" }}>{m.month}</span>
                    <span style={{ color: selectedSubject.color, fontWeight: "800" }}>{m.present} Lectures</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: "30px", padding: "20px", borderTop: "1px solid #eee", textAlign: "center" }}>
             <p style={summaryTextStyle}>Taken sessions: {selectedSubject.summary.taken}</p>
             <p style={summaryTextStyle}>Points over taken sessions: {selectedSubject.summary.points}</p>
             <p style={summaryTextStyle}>Percentage over taken sessions: {selectedSubject.summary.percent}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

const summaryTextStyle = { margin: "5px 0", fontSize: "1.1rem", color: "#333", fontWeight: "500" };
const statusBadgeStyle = (isShort) => ({ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", background: isShort ? "#fef2f2" : "#f0fdf4", color: isShort ? "#dc2626" : "#16a34a", border: `1px solid ${isShort ? "#fecaca" : "#bbf7d0"}` });
const tabBtnStyle = (active, color) => ({ padding: "6px 15px", borderRadius: "8px", border: active ? `2px solid ${color}` : "2px solid #e2e8f0", background: active ? `${color}15` : "#fff", color: active ? color : "#64748b", fontWeight: "800", cursor: "pointer", fontSize: "11px", transition: "0.2s" });
const miniCardStyle = { background: "#fff", padding: "12px 15px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "5px" };