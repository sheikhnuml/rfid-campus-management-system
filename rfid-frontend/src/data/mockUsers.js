// src/data/mockUsers.js
// Central mock user database for demo purposes

export const users = [
  // Admin
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "System Administrator",
    email: "admin@campus.edu"
  },

  // Cafe manager
  {
    username: "cafe1",
    password: "cafe123",
    role: "cafe",
    name: "Café Manager",
    email: "cafe@campus.edu"
  },

  // Library manager
  {
    username: "library1",
    password: "lib123",
    role: "library",
    name: "Library Manager",
    email: "library@campus.edu"
  },

  // Transport manager
  {
    username: "transport1",
    password: "bus123",
    role: "transport",
    name: "Transport Manager",
    email: "transport@campus.edu"
  },

  // Security / Gate operator
  {
    username: "security1",
    password: "gate123",
    role: "security",
    name: "Gate Operator",
    email: "security@campus.edu"
  },

  // Multiple students
  {
    username: "stu_ali",
    password: "ali123",
    role: "student",
    name: "Ali Khan",
    studentId: "S1001",
    wallet: 320.5,
    attendance: 95,
    borrowed: 1,
    email: "ali.khan@campus.edu"
  },
  {
    username: "stu_sara",
    password: "sara123",
    role: "student",
    name: "Sara Iqbal",
    studentId: "S1002",
    wallet: 85.0,
    attendance: 88,
    borrowed: 0,
    email: "sara.iqbal@campus.edu"
  },
  {
    username: "stu_usman",
    password: "usman123",
    role: "student",
    name: "Usman Ahmed",
    studentId: "S1003",
    wallet: 150.25,
    attendance: 92,
    borrowed: 2,
    email: "usman.ahmed@campus.edu"
  },
  {
    username: "stu_laiba",
    password: "laiba123",
    role: "student",
    name: "Laiba",
    studentId: "S1004",
    wallet: 60.0,
    attendance: 80,
    borrowed: 0,
    email: "laiba@campus.edu"
  }
];

// helper
export function findUserByUsername(username) {
  return users.find((u) => u.username === username);
}
