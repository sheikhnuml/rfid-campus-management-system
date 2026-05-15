# 🎓 StudentSync: RFID-Based Smart Campus Management System

**StudentSync** is a professional IoT and MERN-stack solution designed to revolutionize campus life through automation. By utilizing a single RFID card, the system integrates hardware and software to manage attendance, cashless payments, library resources, and secure transport access.

---

## 🏗️ System Architecture

The system follows a modular architecture connecting physical hardware to a scalable cloud backend.

* **Edge Device:** Raspberry Pi 4 running Python (CustomThinker logic).
* **Backend:** Node.js & Express.js handling business logic.
* **Database:** MongoDB Atlas for real-time cloud storage.
* **Frontend:** React.js dashboards for administrative and student use.

---

## 🚀 Key Modules & Functionality

### 📍 Attendance System
- **Process:** Scan → UID Validation → Presence Logging → LCD Feedback.
- **Goal:** Automated, tamper-proof attendance for students and staff.

### 💳 E-Wallet (Cafeteria)
- **Process:** Amount Input → RFID Tap → Balance Check → Deduction → Receipt Display.
- **Goal:** Cashless campus environment with transaction history tracking.

### 📚 Library Management
- **Process:** Book ID Scan → Student Card Tap → Database Linking → Inventory Update.
- **Goal:** Digital tracking of issued books and automated fine calculation.

### 🚌 Transport & Gate Access
- **Process:** Scan → Eligibility Verification → API Response → Access Granted/Denied.
- **Goal:** Secure entry management based on student status.

---

## 🛠️ Technical Stack (Versions)

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **Node.js** | Server Runtime | v20.x |
| **Express.js** | Backend Framework | v4.19.x |
| **React.js** | Frontend UI | v18.3.x |
| **MongoDB** | Cloud Database | v7.0 (Atlas) |
| **Python** | Hardware Controller | v3.11.x |
| **Vite** | Frontend Tooling | v5.x |
| **CSS3** | Custom Styling | Modern Standards |

---

## 📟 Hardware Components

- **Controller:** Raspberry Pi 4 Model B (4GB RAM)
- **RFID Reader:** MFRC522 (13.56MHz)
- **Display:** 5-inch LCD Touchscreen (HDMI Interface)
- **Audio/Visual:** Piezo Buzzer & LED Status Indicators
- **Power:** 5V 3A Type-C Supply

---

## 📂 Project Structure

```text
StudentSync/
├── rfid-backend/        # Node.js API, Models, Routes, Controllers
├── rfid-frontend/       # React components, Pages, State Management
└── docs/                # Project Diagrams & Documentation


  

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
- Go to rfid-frontend/
- Run npm install
- Run npm run dev (for Vite) or npm start.
-------------------------------------------------
