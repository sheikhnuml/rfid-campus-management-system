# StudentSync: RFID-Based Smart Campus Management System

**StudentSync** is a MERN stack-based IoT solution designed to digitize campus activities using a single RFID card. This project integrates hardware (Raspberry Pi) with a modern web ecosystem to streamline attendance, payments, and library management.

## 🚀 Key Features
- **Attendance System:** Real-time presence logging via RFID tap.
- **E-Wallet (Cafeteria):** Cashless transactions for students and staff.
- **Library Management:** Easy book issuing and return tracking.
- **Unified Dashboard:** Separate portals for Admins, Librarians, and Students.

## 🛠️ Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Hardware Interface:** Python (Raspberry Pi 4)

## 📂 Project Structure
- `rfid-frontend/`: React application for dashboards and portals.
- `rfid-backend/`: Express API for business logic and database management.

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/sheikhnuml/rfid-campus-management-system.git](https://github.com/sheikhnuml/rfid-campus-management-system.git)
   

-------------------------------------------------

Setup Backend:
- Go to rfid-backend/
- Run npm install
- Create a .env file with your MONGO_URI and PORT.
- Run npm start
-------------------------------------------------

Setup Frontend:
Go to rfid-frontend/
Run npm install
Run npm run dev (for Vite) or npm start.
-------------------------------------------------
