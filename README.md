# TAGT – Property Management & Analytics Platform

TAGT is a **modern SaaS-style property management platform** designed for **PG, hostel, and co-living operators**.
It helps property owners manage residents, automate rent billing, track maintenance requests, and gain real-time insights through analytics dashboards.

The goal of TAGT is to provide a **single platform to manage property operations efficiently while leveraging data-driven insights.**

---

## 🚀 Features

### Property Management

* Create and manage properties
* Room and bed assignment system
* Multi-property support
* Resident onboarding workflow

### Resident Management

* Resident signup and onboarding
* Owner approval for join requests
* Room and bed assignment
* Resident activity tracking

### Automated Rent Billing

* Monthly rent generation
* Payment tracking
* Late fee automation
* Payment reminders

### Maintenance Management

* Residents can submit maintenance requests
* Track request status
* Property maintenance analytics

### Analytics Dashboard

* Revenue insights
* Occupancy tracking
* Payment collection analytics
* Operational insights for property owners

### Background Job Automation

* Automated rent generation
* Overdue payment detection
* Reminder notifications
* Scheduled system tasks

### Security & Access Control

* Firebase authentication
* Role-based access control
* Multi-tenant property isolation
* Rate limiting & security middleware

---

## 🧠 System Architecture

The platform follows a **modern SaaS architecture**.

Frontend
Next.js + React + TailwindCSS

Backend
Node.js + Express API

Database
MongoDB

Infrastructure
Redis + BullMQ background workers

Payments
Stripe integration

Authentication
Firebase Auth

Analytics
Custom analytics engines for revenue and occupancy insights

---

## 🛠 Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* Recharts

### Backend

* Node.js
* Express
* MongoDB (Mongoose)

### Infrastructure

* Redis
* BullMQ job queues

### Integrations

* Stripe payments
* Firebase authentication
* Swagger API documentation

---

## 📂 Project Structure

```
project-root
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── services
│   ├── analytics
│   └── jobs
│
├── web
│   ├── app
│   ├── components
│   ├── features
│   └── styles
│
└── docs
```

---

## 🔐 Roles & Permissions

The system supports three main roles:

### Super Admin

* Platform management
* Owner account creation
* System monitoring

### Property Owner

* Manage properties
* Create rooms and beds
* Approve resident join requests
* Manage payments and maintenance

### Resident

* Join property
* Submit maintenance requests
* Track rent payments

---

## 📊 Key Workflows

### Resident Onboarding

1. Resident signs up
2. Resident sends request to join property
3. Owner reviews request
4. Owner approves request
5. Resident assigned room/bed

---

### Rent Billing Automation

1. Monthly job runs automatically
2. Rent payments generated for residents
3. Payment reminders sent
4. Overdue payments detected

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/tagt.git
cd tagt
```

---

### Install dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd web
npm install
```

---

### Setup environment variables

Create `.env` files for backend configuration.

Example:

```
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=your_key
```

---

### Start development servers

Backend

```bash
npm run dev
```

Frontend

```bash
cd web
npm run dev
```

---

## 📈 Future Improvements

* Real-time analytics dashboards
* Mobile responsive improvements
* Property performance insights
* Notification system
* Multi-language support

---

## 💡 Motivation

Many PG and co-living operators still manage their operations manually using spreadsheets or messaging apps.
TAGT aims to provide a **modern operational platform that automates workflows and provides actionable insights.**

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit pull requests.

---

## ⭐ Support

If you find this project helpful, consider giving it a ⭐ on GitHub.
