# 🛡️ Subscription Guardian AI

Subscription Guardian AI is an AI-powered web application that helps users manage their paid subscriptions and free trials in one place.

The application tracks subscription renewal dates, free-trial expiry dates, spending, and upcoming payments. It also provides an AI parser that can extract subscription information from emails.

---

## 🎯 Project Objective

The main objective of Subscription Guardian AI is to help users:

- Track active subscriptions
- Track free trials
- Avoid unexpected subscription renewals
- Monitor monthly and yearly spending
- Receive renewal and expiry reminders
- Analyze subscription spending
- Automatically extract subscription details from emails using AI

---

## ✨ Main Features

### 🔐 User Authentication

- User registration
- User login
- JWT-based authentication
- Protected application routes
- Logout functionality

### 💳 Subscription Management

Users can:

- Add subscriptions
- View subscriptions
- Search subscriptions
- Filter subscriptions
- Edit subscriptions
- Delete subscriptions
- Track renewal dates
- Track billing cycles

### 🎁 Free Trial Management

Users can:

- Add free trials
- View free trials
- Search free trials
- Filter free trials
- Edit free trials
- Delete free trials
- Track trial expiry dates

### 📊 Dashboard

The dashboard provides:

- Active subscription count
- Monthly spending
- Yearly spending
- Upcoming renewals
- Upcoming free-trial expirations
- Category-based spending information

### 📈 Analytics

The analytics section provides:

- Spending by category
- Subscription count by category
- Monthly spending
- Yearly spending
- Visual charts

### 🤖 AI Subscription Parser

The AI parser analyzes subscription-related emails and extracts information such as:

- Service name
- Subscription type
- Amount
- Currency
- Billing cycle
- Renewal date
- Free-trial expiry date

The extracted information can be reviewed and saved directly into the user's account.

### 🔔 Notifications

The application provides reminders for:

- Upcoming subscription renewals
- Upcoming free-trial expirations
- Different reminder priorities

### ⚙️ Settings

Users can:

- Update their profile
- Change their password
- Configure notification preferences
- Configure reminder timing

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │  Vite + Tailwind    │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ PostgreSQL │   │ AI Parser  │   │  Reminder  │
       │  Database  │   │    NLP     │   │   System   │
       └────────────┘   └────────────┘   └────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- JWT Authentication

### Database

- PostgreSQL

### AI / NLP

- Python
- spaCy
- Natural Language Processing

---

## 📁 Project Structure

```text
subscription-guardian/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── parser.py
│   │   │
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── auth_routes.py
│   │   ├── routes.py
│   │   ├── dashboard_routes.py
│   │   ├── free_trial_routes.py
│   │   ├── reminder_routes.py
│   │   ├── ai_routes.py
│   │   └── profile_routes.py
│   │
│   ├── .env
│   ├── .gitignore
│   ├── requirements.txt
│   └── venv/
│
├── src/
│   ├── api/
│   │   └── axios.js
│   │
│   ├── components/
│   ├── pages/
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── public/
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## 🚀 How to Run the Project

### 1. Clone or open the project

Open the project folder:

```powershell
cd "C:\Users\subik\OneDrive\Desktop\subscription-guardian"
```

---

# 🔙 Backend Setup

Open a terminal.

Go to the backend folder:

```powershell
cd "C:\Users\subik\OneDrive\Desktop\subscription-guardian\backend"
```

Activate the virtual environment:

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

Start the FastAPI server:

```powershell
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### Swagger API Documentation

Open:

```text
http://127.0.0.1:8000/docs
```

Swagger can be used to test the backend API endpoints.

---

# 💻 Frontend Setup

Open a **second terminal**.

Go to the main project folder:

```powershell
cd "C:\Users\subik\OneDrive\Desktop\subscription-guardian"
```

Install dependencies:

```powershell
npm install
```

Start the React development server:

```powershell
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

## 🔗 Application URLs

### Frontend

```text
http://localhost:5173
```

### Backend

```text
http://127.0.0.1:8000
```

### API Documentation

```text
http://127.0.0.1:8000/docs
```

---

## 🗄️ Database

The project uses PostgreSQL.

Database name:

```text
subscription_guardian
```

The database stores information required by the application, including:

- Users
- Subscriptions
- Free trials
- Subscription information

---

## 🔒 Security

The application uses:

- JWT authentication
- Password hashing
- Protected API endpoints
- Environment variables for sensitive configuration
- `.gitignore` to prevent sensitive files from being committed

The `.env` file contains sensitive configuration and should not be uploaded to GitHub.

---

## 🤖 AI Processing Flow

The AI Subscription Parser follows this general process:

```text
Subscription Email
        │
        ▼
   React Frontend
        │
        ▼
   POST /ai/parse
        │
        ▼
   FastAPI Backend
        │
        ▼
     AI Parser
        │
        ▼
 Extract Information
        │
        ├── Service Name
        ├── Subscription Type
        ├── Amount
        ├── Currency
        ├── Billing Cycle
        └── Renewal Date
        │
        ▼
 Review / Edit
        │
        ▼
 Save Subscription
```

---

## 🔐 Authentication Flow

```text
User
 │
 ▼
Register
 │
 ▼
Login
 │
 ▼
JWT Token
 │
 ▼
Stored in Browser
 │
 ▼
Axios
 │
 ▼
Authorization: Bearer <token>
 │
 ▼
Protected FastAPI Endpoints
```

---

## 📊 Application Modules

The application is divided into the following major modules:

```text
Subscription Guardian AI
│
├── Authentication
│   ├── Register
│   ├── Login
│   └── Logout
│
├── Dashboard
│
├── Subscriptions
│   ├── Add
│   ├── View
│   ├── Search
│   ├── Filter
│   ├── Edit
│   └── Delete
│
├── Free Trials
│   ├── Add
│   ├── View
│   ├── Search
│   ├── Filter
│   ├── Edit
│   └── Delete
│
├── AI Parser
│   ├── Email Analysis
│   ├── Information Extraction
│   ├── Manual Editing
│   └── Save to Account
│
├── Reminders
│
├── Analytics
│
├── Profile
│
└── Settings
```

---

## 🧪 Testing

The backend APIs can be tested using FastAPI Swagger:

```text
http://127.0.0.1:8000/docs
```

Important endpoints include:

```text
POST   /auth/register
POST   /auth/login

GET    /subscriptions/
POST   /subscriptions/
PUT    /subscriptions/{id}
DELETE /subscriptions/{id}

GET    /free-trials/
POST   /free-trials/

GET    /dashboard/
GET    /reminders/

POST   /ai/parse

GET    /profile/
PUT    /profile/
```

---

## 📌 Project Status

Subscription Guardian AI includes:

- User authentication
- Subscription management
- Free-trial management
- Dashboard
- Analytics
- Reminder system
- Profile management
- Settings
- AI subscription email parser
- PostgreSQL database integration
- JWT authentication
- React frontend
- FastAPI backend

---

## 🎓 Project Type

**Academic / Student Project**

### Domain

```text
Artificial Intelligence
Web Development
Natural Language Processing
Subscription Management
Database Management
```

---

## 👩‍💻 Development Stack Summary

```text
Frontend
   ↓
React + Vite + Tailwind CSS
   ↓
Axios REST API
   ↓
FastAPI
   ↓
SQLAlchemy
   ↓
PostgreSQL

AI Module
   ↓
Python + NLP / spaCy
```

---

## 📄 License

This project is developed for educational and academic purposes.