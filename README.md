# 🪖 Military Asset Management System

A comprehensive **web-based application** for managing military assets — including vehicles, weapons, and ammunition — across multiple bases. The system supports **role-based access control**, **end-to-end audit trails**, and **real-time operational visibility**.

---

## 🚀 Features

* **Dashboard** — Real-time metrics with interactive filters (Date, Base, Equipment Type)
* **Purchase Management** — Record and track asset purchases with full history
* **Transfer Management** — Request and approve asset transfers between bases
* **Assignment Management** — Assign equipment to personnel and track returns
* **Role-Based Access Control (RBAC)** — Three distinct roles with scoped permissions
* **Audit Logging** — Complete audit trail of all operations
* **Responsive Design** — Optimized for desktop and mobile devices

---

## 👥 User Roles

* **Admin**
  Full system access across all bases and operations

* **Base Commander**
  Manage assets for own base, approve incoming transfers, create purchases

* **Logistics Officer**
  Limited access to purchases and transfers

---

## 🛠️ Tech Stack

### Frontend

* React 18
* React Router DOM
* Axios
* Pure CSS (no UI frameworks)

### Backend

* Node.js & Express
* PostgreSQL
* JWT Authentication
* bcrypt (password hashing)
* Helmet (security)
* Morgan (logging)

### Deployment

* **Frontend**: Render
* **Backend**: Render
* **Database**: Render PostgreSQL

---

## 🗄️ Database Schema

The system is built on **9 core tables**:

* `users` — Authentication and roles
* `bases` — Military base details
* `equipment_types` — Asset categories
* `assets` — Individual asset tracking
* `purchases` — Purchase records
* `transfers` — Inter-base asset transfers
* `assignments` — Personnel assignments
* `expenditures` — Asset expenditure tracking
* `audit_logs` — Full audit trail

---

## ⚙️ Getting Started

### Prerequisites

* Node.js 14+
* npm
* PostgreSQL 12+
* Git

---

## 📦 Installation

### Clone the Repository

```bash
git clone https://github.com/SANITPRAKASH/military-asset-system.git
cd military-asset-system
```

---

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
JWT_SECRET=SECRET_MILITARY_KEY
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://military_asset_db_9kaq_user:0rdkqmHDgwfcGyZIoqimI02OZsqesB7f@dpg-d4vgb4er433s73e5mf7g-a.oregon-postgres.render.com/military_asset_db_9kaq
```

---

### 🗃️ Database Setup

```bash
# Create database
createdb military_assets

# Run schema
psql military_assets < schema.sql
```

---

### 🎨 Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ▶️ Running Locally

### Terminal 1 — Backend

```bash
cd backend
npm start
```

Server runs at: `http://localhost:5000`

### Terminal 2 — Frontend

```bash
cd frontend
npm start
```

App runs at: `http://localhost:3000`

---

## 🔐 Default Login

```
Username: admin
Password: admin123
```

---

## 📡 API Endpoints

### Authentication

* `POST /api/auth/login`
* `POST /api/auth/register` (Admin only)
* `GET /api/auth/me`
* `POST /api/auth/logout`

### Dashboard

* `GET /api/dashboard/metrics`
* `GET /api/dashboard/movement-details`

### Purchases

* `GET /api/purchases`
* `POST /api/purchases`
* `GET /api/purchases/:id`
* `PUT /api/purchases/:id`
* `DELETE /api/purchases/:id`

### Transfers

* `GET /api/transfers`
* `POST /api/transfers`
* `PUT /api/transfers/:id/approve`
* `PUT /api/transfers/:id/cancel`

### Assignments

* `GET /api/assignments`
* `POST /api/assignments`
* `PUT /api/assignments/:id/return`

### Bases

* `GET /api/bases`
* `GET /api/bases/:id`
* `POST /api/bases` (Admin only)
* `PUT /api/bases/:id` (Admin only)

---

## 🔒 Security Features

* JWT-based authentication
* bcrypt password hashing (10 salt rounds)
* Role-based access control (RBAC)
* Helmet.js security headers
* CORS protection
* SQL injection prevention (parameterized queries)
* Comprehensive audit logging

---

## 📱 Screenshots

### Login Page

<img width="2200" height="1434" alt="Login Page" src="https://github.com/user-attachments/assets/25600cd8-b2a8-4ae0-9f39-d2d8fe3b802d" />

### Dashboard Page

<img width="2255" height="1430" alt="Dashboard" src="https://github.com/user-attachments/assets/b5a040dd-770f-49cb-a813-789d6c120a6a" />

### Purchase Page

<img width="2255" height="1430" alt="Purchase" src="https://github.com/user-attachments/assets/2217b4a9-4b8c-4c50-bd61-309098c8ceae" />

### Transfer Page

<img width="2255" height="1426" alt="Transfer" src="https://github.com/user-attachments/assets/d6b5e6a3-fb80-4a61-baae-77376e902150" />

### Assignment Page

<img width="2255" height="1357" alt="Assignment" src="https://github.com/user-attachments/assets/e8d00bf4-15fe-4664-8dd9-f94874bc013b" />

### Register Page

<img width="2255" height="1437" alt="Register" src="https://github.com/user-attachments/assets/d511cda2-f021-468d-be9b-bc57ac65c112" />

---

## 📄 License

This project is intended for **educational and demonstration purposes**.
