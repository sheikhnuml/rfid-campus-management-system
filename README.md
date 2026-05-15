# 🎓 RFID-Based Smart Campus Card System

This project is a modern IoT and MERN-stack based smart campus solution designed to automate and simplify university operations. Using a single RFID card, the system integrates hardware and software to manage attendance, cashless payments, library services, and secure transport/gate access.

The project combines RFID technology, Raspberry Pi automation, and a cloud-based MERN architecture to provide a centralized and efficient campus management experience.

---

# 🏗️ System Architecture

The system follows a modular architecture that connects physical RFID hardware with a scalable cloud backend.

## 🔹 Edge Device
- Raspberry Pi 4 running Python scripts
- Handles RFID scanning and hardware interaction
- Executes custom logic for real-time operations

## 🔹 Backend
- Built with Node.js and Express.js
- Manages APIs, authentication, and business logic
- Connects hardware requests with the database

## 🔹 Database
- MongoDB Atlas for cloud-based real-time storage
- Stores users, attendance, transactions, and records

## 🔹 Frontend
- Developed using React.js
- Provides dashboards for students and administrators
- Displays real-time system data and analytics

---

# 🚀 Core Modules & Features

## 📍 Attendance Management System

### Workflow
```text
RFID Scan → UID Validation → Attendance Logging → LCD Feedback
```

### Features
- Automated attendance marking
- Real-time database synchronization
- Tamper-proof student verification
- LCD display confirmation messages
- Attendance history tracking

### Objective
To eliminate manual attendance processes and improve accuracy.

---

## 💳 Smart E-Wallet System (Cafeteria)

### Workflow
```text
Amount Input → RFID Tap → Balance Verification → Deduction → Receipt Display
```

### Features
- Cashless payment system
- Secure balance management
- Transaction history records
- Instant payment confirmation
- Fast cafeteria operations

### Objective
To create a secure and efficient digital payment environment inside the campus.

---

## 📚 Library Management System

### Workflow
```text
Book ID Scan → Student RFID Tap → Database Linking → Inventory Update
```

### Features
- Book issuing and returning automation
- RFID-based student verification
- Real-time inventory management
- Fine calculation system
- Book tracking and history

### Objective
To digitize and automate library operations.

---

## 🚌 Transport & Gate Access System

### Workflow
```text
RFID Scan → Eligibility Verification → API Response → Access Granted/Denied
```

### Features
- Secure campus entry system
- Student transport verification
- Unauthorized access prevention
- Real-time validation through APIs
- Gate activity logging

### Objective
To improve campus security and transport management.

---

# 🛠️ Technology Stack

| Technology | Purpose | Version |
|---|---|---|
| Node.js | Server Runtime | v20.x |
| Express.js | Backend Framework | v4.19.x |
| React.js | Frontend UI | v18.3.x |
| MongoDB Atlas | Cloud Database | v7.0 |
| Python | Hardware Controller | v3.11.x |
| Vite | Frontend Tooling | v5.x |
| CSS3 | Styling & UI Design | Modern Standards |

---

# 📟 Hardware Components

| Component | Description |
|---|---|
| Raspberry Pi 4 Model B | Main Controller (4GB RAM) |
| MFRC522 RFID Reader | 13.56MHz RFID Scanner |
| 5-inch LCD Touchscreen | HDMI Display Interface |
| Piezo Buzzer | Audio Feedback |
| LED Indicators | Status Notifications |
| 5V 3A Type-C Supply | Power Source |

---

# 📂 Project Structure

```text
RFID-Smart-Campus-System/
│
├── rfid-backend/        # Node.js API, Models, Routes & Controllers
├── rfid-frontend/       # React Components, Pages & State Management
├── hardware-scripts/    # Python RFID & Raspberry Pi Logic
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/sheikhnuml/rfid-campus-management-system.git

cd rfid-campus-management-system
```

---

# 🔧 Backend Setup

## Navigate to Backend Directory

```bash
cd rfid-backend
```

## Install Dependencies

```bash
npm install
```

## Create `.env` File

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Start Backend Server

```bash
npm start
```

---

# 💻 Frontend Setup

## Navigate to Frontend Directory

```bash
cd rfid-frontend
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

> If using Create React App instead of Vite:

```bash
npm start
```

---

# 🔌 Hardware Setup

## Required Connections
- Connect the MFRC522 RFID Reader to Raspberry Pi GPIO pins
- Attach the LCD Display using HDMI
- Connect LEDs and Buzzer to GPIO outputs
- Power Raspberry Pi using a 5V 3A Type-C adapter

## Run Python Hardware Controller

```bash
python main.py
```

---

# 🌟 Future Improvements

- Mobile Application Integration
- Face Recognition Authentication
- QR Code Support
- AI-based Attendance Analytics
- NFC-enabled Smart Payments
- Cloud Notification System

