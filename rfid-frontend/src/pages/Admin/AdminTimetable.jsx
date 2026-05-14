import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminTimetable() {
  const [schedules, setSchedules] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "",
    teacher: "",
    day: "Monday",
    startTime: "",
    endTime: "",
    room: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [timeRes, userRes] = await Promise.all([
        axios.get("http://localhost:5000/api/timetable"),
        axios.get("http://localhost:5000/api/users")
      ]);

      setSchedules(timeRes.data);

      // 🟢 Extracting Unique Subjects from all registered students
      const allSubjects = [];
      userRes.data.forEach(user => {
        if (user.subjects) {
          user.subjects.forEach(sub => {
            if (!allSubjects.includes(sub)) allSubjects.push(sub);
          });
        }
      });
      setAvailableSubjects(allSubjects);
      
      setLoading(false);
    } catch (err) {
      console.error("Data Fetch Error:", err);
      setLoading(false);
    }
  };

  // 🟢 UPDATED: handleAddSchedule with Backend Collision Logic
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    // Safety check for subject selection
    if (!formData.subject) return alert("Please select a subject first!");

    try {
      const res = await axios.post("http://localhost:5000/api/timetable", formData);
      setShowModal(false);
      fetchInitialData(); // Refresh everything
      alert("Schedule added successfully!");
      
      // Reset form
      setFormData({ subject: "", teacher: "", day: "Monday", startTime: "", endTime: "", room: "" });
    } catch (err) {
      // 🟢 Display the specific collision message from backend (Room busy or Teacher busy)
      alert(err.response?.data?.message || "Error adding schedule");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this slot?")) {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`);
      fetchInitialData();
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading Timetable Data...</div>;

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h2 style={{ color: "#0f172a", margin: 0 }}>Academic Timetable</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Schedule classes based on registered courses</p>
        </div>
        <button onClick={() => setShowModal(true)} style={addBtnStyle}>+ Add Schedule Slot</button>
      </div>

      <div className="card" style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={tableHeaderStyle}>
              <th style={{ padding: "15px" }}>DAY</th>
              <th>SUBJECT</th>
              <th>TEACHER</th>
              <th>TIME</th>
              <th>ROOM</th>
              <th style={{ textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td style={{ padding: "15px", fontWeight: "700", color: "#4f46e5" }}>{s.day}</td>
                <td style={{ fontWeight: "600" }}>{s.subject}</td>
                <td style={{ color: "#64748b" }}>{s.teacher}</td>
                <td><span style={timeBadgeStyle}>{s.startTime} - {s.endTime}</span></td>
                <td>{s.room}</td>
                <td style={{ textAlign: "right" }}>
                  <button onClick={() => handleDelete(s._id)} style={deleteBtnStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD MODAL --- */}
      {showModal && (
        <div style={modalOverlay}>
          <div className="card" style={{ width: "500px", padding: "30px", borderRadius: "20px" }}>
            <h3 style={{ marginBottom: "20px" }}>New Schedule Entry</h3>
            <form onSubmit={handleAddSchedule}>
              <div style={formGrid}>
                
                {/* 🟢 SUBJECT DROPDOWN (Mistake Proof) */}
                <div style={inputGroup}>
                  <label>Select Course (From Database)</label>
                  <select 
                    value={formData.subject} 
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  >
                    <option value="">-- Choose Subject --</option>
                    {availableSubjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div style={inputGroup}>
                  <label>Teacher Name</label>
                  <input type="text" value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})} required />
                </div>
                <div style={inputGroup}>
                  <label>Day</label>
                  <select value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={inputGroup}>
                  <label>Room No.</label>
                  <input type="text" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} required />
                </div>
                <div style={inputGroup}>
                  <label>Start Time</label>
                  <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} required />
                </div>
                <div style={inputGroup}>
                  <label>End Time</label>
                  <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" style={saveBtn}>Confirm Slot</button>
                <button type="button" onClick={() => setShowModal(false)} style={cancelBtn}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; padding: 15px; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const cardStyle = { background: "white", padding: "15px", borderRadius: "15px", border: "1px solid #e2e8f0" };
const tableHeaderStyle = { textAlign: "left", borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "12px" };
const addBtnStyle = { padding: "12px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };
const deleteBtnStyle = { background: "none", border: "none", color: "#ef4444", fontWeight: "bold", cursor: "pointer" };
const timeBadgeStyle = { background: "#eef2ff", color: "#4f46e5", padding: "4px 10px", borderRadius: "15px", fontSize: "11px", fontWeight: "700" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const saveBtn = { flex: 1, padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: "10px", fontWeight: "700" };
const cancelBtn = { flex: 1, padding: "12px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "10px", fontWeight: "700" };