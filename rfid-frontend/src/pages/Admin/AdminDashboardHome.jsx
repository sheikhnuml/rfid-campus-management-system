import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// 🟢 NEW: Socket Import
import io from "socket.io-client";

// 🟢 NEW: Socket Connection Setup
const socket = io("http://localhost:5000");

// 🟢 Dropdown Options
const DEPARTMENTS = ["Computer Science", "Software Engineering", "Artificial Intelligence", "Information Security"];
const COURSES_LIST = ["DSA", "DLA", "WEB", "PF", "ICT", "AI", "OOP", "SE", "IT", "MATH"];

export default function AdminDashboardHome() {
  const [students, setStudents] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("students"); 
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newDept, setNewDept] = useState("Computer Science"); // Default set to first option
  const [newBus, setNewBus] = useState("no"); 
  const [rfidTag, setRfidTag] = useState(""); 
  const [subjectsInput, setSubjectsInput] = useState("");
  const [extraData, setExtraData] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, []);

  // 🟢 Socket Listener for Real-time RFID Capture
  useEffect(() => {
    socket.on("new-rfid-captured", (tag) => {
      if (editingUser) {
        setEditingUser(prev => ({ ...prev, rfidTag: tag }));
      } else {
        setRfidTag(tag);
      }
      setIsScanning(false);
      console.log("Captured RFID:", tag);
    });
    return () => socket.off("new-rfid-captured");
  }, [editingUser]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users"); 
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      setLoading(false);
    }
  };

  // 🟢 Helper Function to add courses from dropdown
  const handleAddCourse = (course) => {
    if (!course) return;
    const currentSubjects = subjectsInput ? subjectsInput.split(", ").filter(s => s !== "") : [];
    if (!currentSubjects.includes(course)) {
      const updated = [...currentSubjects, course].join(", ");
      setSubjectsInput(updated);
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !newStudentId) return;
    const subjectsArray = subjectsInput.split(",").map(s => s.trim()).filter(s => s !== "");
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name: newStudentName, 
        studentId: newStudentId, 
        password: "123", 
        role: newRole, 
        department: newDept, 
        bus: newBus === "yes", 
        rfidTag: rfidTag || "Pending_" + Date.now(),
        subjects: subjectsArray, 
        ...extraData 
      });
      if (res.data.success) {
        fetchUsers(); 
        setNewStudentName(""); setNewStudentId(""); setRfidTag(""); setSubjectsInput(""); setNewBus("no");
      }
    } catch (err) { alert("Registration Failed"); }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try { await axios.delete(`http://localhost:5000/api/users/${id}`); fetchUsers(); }
      catch (err) { alert("Delete failed"); }
    }
  };

  const toggleStatus = async (id) => {
    try { await axios.patch(`http://localhost:5000/api/users/status/${id}`); fetchUsers(); }
    catch (err) { alert("Status update failed"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedData = { 
      ...editingUser,
      subjects: typeof editingUser.subjects === "string" 
        ? editingUser.subjects.split(",").map(s => s.trim()).filter(s => s !== "") 
        : editingUser.subjects
    };
    try {
      await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, updatedData);
      setEditingUser(null); 
      fetchUsers();
    } catch (err) { alert("Update failed"); }
  };

  const filteredUsers = students.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const studentsList = filteredUsers.filter(u => u.role === "student");
  const managementList = filteredUsers.filter(u => u.role !== "student");

  const totalRecords = students.length;
  const blockedCount = students.filter(u => u.status === "blocked").length;
  const activeCount = totalRecords - blockedCount;

  if (loading) return <div style={{ padding: "20px" }}>Loading Campus Data...</div>;

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.5s ease" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2 style={{ color: "#1e293b", fontWeight: "800", margin: 0 }}>👥 Campus Directory</h2>
        {/* <button onClick={() => navigate("/terminal")} style={btnStyleTerminal}>📟 Launch Global Terminal</button> */}
      </div>

      {/* ANALYTICS CARDS (Remains Same) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="card" style={statCardStyle("#4f46e5")}>
          <div style={iconCircleStyle}>👥</div>
          <div><p style={cardLabelStyle}>Total Records</p><h2 style={cardValueStyle}>{totalRecords}</h2></div>
        </div>
        <div className="card" style={statCardStyle("#10b981")}>
          <div style={iconCircleStyle}>✅</div>
          <div><p style={cardLabelStyle}>Active Users</p><h2 style={cardValueStyle}>{activeCount}</h2></div>
        </div>
        <div className="card" style={statCardStyle("#ef4444")}>
          <div style={iconCircleStyle}>🚫</div>
          <div><p style={cardLabelStyle}>Banned Users</p><h2 style={cardValueStyle}>{blockedCount}</h2></div>
        </div>
      </div>

      {/* SEARCH BOX (Remains Same) */}
      <div className="card" style={searchBoxStyle}>
        <span style={{ fontSize: "20px" }}>🔍</span>
        <input 
          type="text" placeholder="Quick search by Name, Student ID, Role or Department..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "12px", border: "none", outline: "none", fontSize: "16px", fontWeight: "500" }}
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "25px", alignItems: "stretch" }}>
        
        {/* REGISTRATION FORM */}
        <div className="card" style={registrationCardStyle}>
          <h3 style={{ marginBottom: "20px", fontSize: "18px", color: "#1e293b" }}>📝 Add New Member</h3>
          <form onSubmit={addStudent} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Student / Staff ID</label>
              <input style={inputStyle} placeholder="Assign ID" value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} placeholder="Full Name" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} required />
            </div>

            {/* 🟢 MODIFIED: Department Dropdown */}
            <div>
              <label style={labelStyle}>Department</label>
              <select value={newDept} onChange={(e) => setNewDept(e.target.value)} style={{...inputStyle, backgroundColor: "#fff"}}>
                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            
            <div>
              <label style={labelStyle}>Bus Service Enrollment</label>
              <select value={newBus} onChange={(e) => setNewBus(e.target.value)} style={{...inputStyle, backgroundColor: "#fff"}}>
                <option value="no">No (Private Transport)</option>
                <option value="yes">Yes (Campus Bus)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Portal Role</label>
              <select value={newRole} onChange={(e) => {setNewRole(e.target.value); setExtraData({});}} style={{...inputStyle, backgroundColor: "#fff"}}>
                <option value="student">Student</option>
                <option value="cafe">Cafe Manager</option>
                <option value="library">Library Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <label style={labelStyle}>RFID Tag (Automatic Capture)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  style={{...inputStyle, border: "1.5px solid #4f46e5"}} 
                  placeholder={isScanning ? "Tap Card Now..." : "Scan Card..."} 
                  value={rfidTag} 
                  readOnly
                />
                {/* <button 
                  type="button" 
                  onClick={() => setIsScanning(true)}
                  style={{ ...actionBtn(isScanning ? "#ef4444" : "#4f46e5"), height: "42px", minWidth: "80px" }}
                >
                  {isScanning ? "..." : "Scan"}
                </button> */}
              </div>
              
              {newRole === "student" && (
                <div style={{marginTop: "10px"}}>
                  <label style={labelStyle}>Select Courses (Click to add)</label>
                  {/* 🟢 MODIFIED: Course Dropdown */}
                  <select 
                    onChange={(e) => handleAddCourse(e.target.value)} 
                    style={{...inputStyle, backgroundColor: "#fff", marginBottom: "8px"}}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Choose Course --</option>
                    {COURSES_LIST.map(course => <option key={course} value={course}>{course}</option>)}
                  </select>
                  
                  {/* Selected Courses Display */}
                  <input 
                    style={{...inputStyle, fontSize: "12px", background: "#f1f5f9"}} 
                    placeholder="Selected: DSA, AI..." 
                    value={subjectsInput} 
                    readOnly 
                  />
                  <small style={{color: "#64748b", cursor: "pointer"}} onClick={() => setSubjectsInput("")}>Clear Selection</small>
                </div>
              )}
            </div>
            <button style={mainBtnStyle} type="submit">Register User</button>
          </form>
        </div>

        {/* DATA TABLE (Remains Same) */}
        <div className="card" style={tableWrapperStyle}>
          <div style={{ display: "flex", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <button onClick={() => setActiveTab("students")} style={activeTab === "students" ? activeTabStyle : tabStyle}>
              Students ({studentsList.length})
            </button>
            <button onClick={() => setActiveTab("management")} style={activeTab === "management" ? activeTabStyle : tabStyle}>
              Staff & Management ({managementList.length})
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                  <th style={thStyle}>ID</th>
                  <th style={{...thStyle, width: "250px"}}>User Details</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={{...thStyle, textAlign: "center"}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "students" ? studentsList : managementList).map((s) => (
                  <tr key={s._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}><strong>{s.studentId.toUpperCase()}</strong></td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>
                        {s.name} 
                        {s.bus && <span style={{fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px'}}>🚌 BUS</span>}
                      </div>
                      <div style={{ fontSize: "11px", color: "#4f46e5", fontWeight: "600" }}>{s.department || "General"}</div>
                      {s.role === "student" && (
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{s.subjects?.join(" • ")}</div>
                      )}
                    </td>
                    <td style={tdStyle}><span style={roleBadge(s.role)}>{s.role.toUpperCase()}</span></td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: s.status === "blocked" ? "#ef4444" : "#10b981", fontWeight: "700", fontSize: "12px" }}>
                        <div style={{ height: "6px", width: "6px", borderRadius: "50%", background: s.status === "blocked" ? "#ef4444" : "#10b981" }}></div>
                        {s.status === "blocked" ? "Banned" : "Active"}
                      </div>
                    </td>
                    <td style={{...tdStyle, textAlign: "right"}}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        <button onClick={() => setEditingUser(s)} style={actionBtn("#4f46e5")}>Edit</button>
                        {s.role.toLowerCase() !== "admin" && (
                          <>
                            <button onClick={() => toggleStatus(s._id)} style={actionBtn(s.status === "blocked" ? "#10b981" : "#f59e0b")}>
                              {s.status === "blocked" ? "Unban" : "Block"}
                            </button>
                            <button onClick={() => deleteUser(s._id)} style={actionBtn("#ef4444")}>Remove</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✏️ EDIT MODAL */}
      {editingUser && (
        <div style={modalOverlayStyle}>
          <div className="card" style={{ 
            width: "600px", padding: "25px", borderRadius: "20px", background: "#fff", 
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto"
          }}>
            <h3 style={{marginBottom: "20px", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px"}}>✏️ Update User Profile</h3>
            <form onSubmit={handleUpdate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} />
                </div>

                {/* 🟢 MODIFIED: Dept Dropdown in Edit */}
                <div>
                  <label style={labelStyle}>Department</label>
                  <select 
                    value={editingUser.department} 
                    onChange={(e) => setEditingUser({...editingUser, department: e.target.value})} 
                    style={{...inputStyle, backgroundColor: "#fff"}}
                  >
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Bus Enrollment Status</label>
                  <select value={editingUser.bus ? "yes" : "no"} onChange={(e) => setEditingUser({...editingUser, bus: e.target.value === "yes"})} style={{...inputStyle, backgroundColor: "#fff"}}>
                    <option value="no">Not Enrolled</option>
                    <option value="yes">Enrolled (Active)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Portal Access Role</label>
                  <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} style={{...inputStyle, backgroundColor: "#fff"}}>
                    <option value="student">Student</option>
                    <option value="cafe">Cafe Manager</option>
                    <option value="library">Library Manager</option>
                    <option value="transport">Transport Head</option>
                    <option value="security">Security</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Wallet Balance (Rs)</label>
                  <input type="number" style={inputStyle} value={editingUser.wallet} onChange={(e) => setEditingUser({...editingUser, wallet: e.target.value})} />
                </div>

                <div>
                  <label style={labelStyle}>RFID Tag (Scan Now)</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input style={{...inputStyle, border: "1.5px solid #4f46e5"}} value={editingUser.rfidTag} readOnly />
                    <button type="button" onClick={() => setIsScanning(true)} style={{ ...actionBtn(isScanning ? "#ef4444" : "#4f46e5"), height: "42px", minWidth: "80px" }}>
                      {isScanning ? "..." : "Scan"}
                    </button>
                  </div>
                </div>

                {editingUser.role === "student" && (
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={labelStyle}>Edit Subjects (pick from list below)</label>
                    {/* 🟢 Course Dropdown in Edit */}
                    <select 
                      onChange={(e) => {
                        const val = e.target.value;
                        const current = Array.isArray(editingUser.subjects) ? editingUser.subjects : [];
                        if(!current.includes(val)) {
                            setEditingUser({...editingUser, subjects: [...current, val]});
                        }
                      }} 
                      style={{...inputStyle, backgroundColor: "#fff", marginBottom: "8px"}}
                      defaultValue=""
                    >
                      <option value="" disabled>-- Add Course --</option>
                      {COURSES_LIST.map(course => <option key={course} value={course}>{course}</option>)}
                    </select>
                    <input style={inputStyle} value={Array.isArray(editingUser.subjects) ? editingUser.subjects.join(", ") : editingUser.subjects} readOnly />
                    <small style={{cursor: "pointer", color: "red"}} onClick={() => setEditingUser({...editingUser, subjects: []})}>Reset Subjects</small>
                  </div>
                )}
              </div>
              
              <div style={{display: "flex", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "15px"}}>
                <button type="submit" style={{...mainBtnStyle, flex: 2}}>Save Changes</button>
                <button type="button" onClick={() => { setEditingUser(null); setIsScanning(false); }} style={{...mainBtnStyle, flex: 1, background: "#f1f5f9", color: "#64748b"}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES (Keep exactly the same as provided)
const registrationCardStyle = { padding: "25px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" };
const tableWrapperStyle = { padding: "0", background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" };
const searchBoxStyle = { padding: "10px 20px", marginBottom: "25px", background: "#fff", borderRadius: "15px", border: "2px solid #eef2ff", display: "flex", alignItems: "center", gap: "10px" };
const statCardStyle = (color) => ({ background: "#fff", padding: "20px", borderRadius: "20px", borderLeft: `6px solid ${color}`, display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" });
const iconCircleStyle = { width: "45px", height: "45px", background: "#f1f5f9", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const cardLabelStyle = { margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" };
const cardValueStyle = { margin: 0, color: "#1e293b", fontSize: "28px", fontWeight: "800" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", boxSizing: "border-box" };
const labelStyle = { fontSize: "11px", color: "#64748b", fontWeight: "700", marginBottom: "4px", display: "block", textTransform: "uppercase" };
const mainBtnStyle = { padding: "12px", background: "#1e293b", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "14px" };
const btnStyleTerminal = { background: "#4f46e5", color: "white", border: "none", padding: "10px 25px", borderRadius: "12px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" };
const thStyle = { padding: "15px 20px", fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" };
const tdStyle = { padding: "18px 20px", fontSize: "13px" };
const actionBtn = (bg) => ({ background: bg, color: "white", border: "none", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "11px", fontWeight: "700", minWidth: "65px" });
const roleBadge = (role) => ({ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", fontWeight: "800", background: role === "student" ? "#e0e7ff" : "#fef3c7", color: role === "student" ? "#4338ca" : "#92400e" });
const tabStyle = { flex: 1, padding: "15px", border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "700", borderBottom: "3px solid transparent", transition: "0.3s" };
const activeTabStyle = { ...tabStyle, color: "#4f46e5", borderBottom: "3px solid #4f46e5", background: "#fff" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };