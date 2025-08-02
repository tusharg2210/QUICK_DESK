# 🚀 QuickDesk - Helpdesk Ticketing System

A modern, full-stack helpdesk application built with **React**, **Node.js**, and **MongoDB**.

---

## 🔧 Features

- 🔐 Google OAuth Authentication (via Firebase)
- 🎭 Role-based Access (End User, Agent, Admin)
- 🎫 Ticket Management with Comments
- 📎 File Attachments Support
- 🔍 Search and Filter Capabilities
- 📊 Real-time Status Updates
- 👍 Voting System for Tickets
- 📧 Email Notifications
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS

---

## 🛠️ Tech Stack

### 🔹 Frontend
- React 18 (with Hooks)
- Vite (Build Tool)
- Tailwind CSS
- React Router DOM
- Axios
- Firebase Auth
- React Hot Toast

### 🔹 Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Firebase Admin SDK
- JWT Authentication
- Multer (File Uploads)
- Nodemailer (Email)

---

## ⚙️ Quick Start

### ✅ Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Firebase project with Google Auth enabled

---

## 📦 Backend Setup

```bash
# 1. Clone and navigate to the backend folder
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FRONTEND_URL=http://localhost:3000
```

Start the server:

```bash
npm run dev
```

---

## 💻 Frontend Setup

```bash
# Navigate to frontend
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

Start the development server:

```bash
npm run dev
```

---

## 👥 User Roles & Permissions

### 🔹 End User
- Create and view own tickets
- Add comments to own tickets
- Vote on tickets
- Update profile settings

### 🔹 Support Agent
- View all tickets
- Assign tickets to self
- Update ticket status
- Add internal/external comments
- Create tickets on behalf of users

### 🔹 Admin
- All agent permissions
- User management (role assignment)
- Category management
- System overview and analytics

---

## 🔗 API Endpoints

### 🔐 Authentication
- `POST /api/auth/login` – Login with Firebase token
- `GET /api/auth/profile` – Get user profile
- `PUT /api/auth/profile` – Update profile

### 🎫 Tickets
- `GET /api/tickets` – List tickets (role-based filter)
- `POST /api/tickets` – Create new ticket
- `GET /api/tickets/:id` – Get ticket details
- `PUT /api/tickets/:id` – Update ticket
- `POST /api/tickets/:id/comments` – Add comment
- `POST /api/tickets/:id/vote` – Vote on ticket

### ⚙️ Admin
- `GET /api/users` – List all users
- `PUT /api/users/:id/role` – Update user role
- `GET /api/categories` – List categories
- `POST /api/categories` – Create category
- `PUT /api/categories/:id` – Update category
- `DELETE /api/categories/:id` – Delete category

---

## 🚀 Deployment

### 🔹 Backend (Railway / Heroku)
- Set environment variables
- Deploy from GitHub repo
- Ensure MongoDB Atlas is publicly accessible

### 🔹 Frontend (Vercel / Netlify)
- Build the project:
  ```bash
  npm run build
  ```
- Deploy `dist/` folder
- Set environment variables
- Configure SPA redirects (`/* → /index.html`)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Add relevant tests (if needed)
5. Submit a pull request 🚀

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Made with ❤️ by Team BitBuddies