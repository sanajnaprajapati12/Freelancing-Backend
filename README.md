# 🚀 Freelancing Hub Workflow Management System (Backend)

## 📌 Description

This backend system powers a **Freelancing Hub Workflow Management Platform** that enables seamless collaboration between clients, freelancers, and teams.

It includes advanced modules like **team management, AI chat system, workflow boards, payment handling, and admin control panel**.

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.io (for real-time chat)

---

## ⚙️ Core Features

### 🔐 Authentication & Authorization

* User Registration & Login
* JWT-based authentication
* Role-based access:

  * Admin
  * Sub-Admin
  * Freelancer
  * Client

---

### 👥 Team Management

* Create & manage teams
* Add/remove team members
* Assign roles within teams

---

### 📁 Project & Task Management

* Create and manage projects
* Task assignment
* Sub-task handling
* Status tracking (Pending / In Progress / Completed)

---

### 📊 Workflow Board

=
* Drag & drop task management (frontend integrated)
* Task status visualization

---

### 🤖 AI Chat System

* Real-time chat between users
* AI-powered responses (if integrated)
* Socket-based communication

---

### 💳 Payment System

* Payment tracking
* Client-to-freelancer transactions
* Payment status management

---

### 🛡️ Admin & Sub-Admin Panel

* Manage all users
* Control projects & workflows
* Monitor payments
* Assign sub-admin roles

---

## 📂 Folder Structure

```id="5pn8ff"
/config        → Database & configuration  
/controllers   → Business logic  
/models        → MongoDB schemas  
/routes        → API routes  
/middleware    → Auth & error handling  
/services      → AI / payment logic  
/utils         → Helper functions  
```

---

## 🔐 Environment Variables

Create a `.env` file:

```id="n1n3yb"
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
STRIPE_SECRET=your_payment_secret
```

---

## 🚀 Installation & Setup

1. Clone the repository
2. Install dependencies

   ```
   npm install
   ```
3. Run server

   ```
   npm start
   ```

For development:

```id="ep6t5c"
npm run dev
```

---

## 📡 API Modules

### 🔑 Auth APIs

* POST /api/auth/register
* POST /api/auth/login

### 👥 Team APIs

* POST /api/teams/create
* GET /api/teams
* PUT /api/teams/:id

### 📁 Project APIs

* POST /api/projects
* GET /api/projects
* DELETE /api/projects/:id

### 📌 Task APIs

* POST /api/tasks
* GET /api/tasks
* PUT /api/tasks/:id

### 📊 Board APIs

* GET /api/board
* PUT /api/board/update

### 🤖 Chat APIs

* POST /api/chat
* GET /api/chat/messages

### 💳 Payment APIs

* POST /api/payments
* GET /api/payments

### 🛡️ Admin APIs

* GET /api/admin/users
* PUT /api/admin/roles

---

## 🧪 Testing

Use:

* Postman
* Thunder Client

---

## 🔒 Security

* Password hashing (bcrypt)
* JWT authentication
* Protected routes
* Role-based authorization

---

## 🌐 Future Enhancements

* Notification system
* AI task suggestions
* Analytics dashboard

---

## 👩‍💻 Author

**Sanjana Prajapati**
Backend Developer | MERN Stack

---

## 📬 Contact

Email: [your-email@gmail.com](mailto:your-email@gmail.com)
LinkedIn: your-linkedin-profile

---
