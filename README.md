# 🧩 Task Management API

Backend Developer – Technical Assessment  
UPT TIK UNPER × PT Novatec Solution 2025

---

## 📘 Project Overview

This project is a **Task Management REST API** built using **Node.js (Express)**, **Prisma ORM**, and **PostgreSQL**.  
It is developed as part of the technical assessment for the **Backend Developer position** at  
UPT TIK UNPER × PT Novatec Solution.

The API implements a **clean architecture (Controller–Service–Repository)**, focusing on scalability, security, and data consistency.

---

## 🧱 System Architecture

### 🧩 Layered Architecture

```
src/
│
├── controllers/ # Handle HTTP requests and responses
├── services/ # Business logic and transaction consistency
├── repositories/ # Prisma queries and database operations
├── middlewares/ # JWT auth, role-based access control, validation, and rate limiting
├── validators/ # Request body validation schemas (e.g., Joi)
├── errors/ # Custom error classes (NotFoundError, ForbiddenError, etc.)
├── utils/ # Helper functions, token utilities, and response formatters
└── config/ # Prisma client, environment configuration, and initialization
```

### 🧰 Tech Stack

-   **Node.js (Express)** – API framework
-   **Prisma ORM** – Database modeling and migrations
-   **PostgreSQL** – Relational database
-   **JWT** – Authentication and refresh tokens
-   **Bcrypt** – Password hashing
-   **Vercel Blob** – File storage for attachments
-   **Jest / Supertest** – Unit & integration testing

---

## 🚀 Setup & Run

### 1️⃣ Clone Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then fill in your actual credentials:

```bash
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=require"
JWT_SECRET="<your-jwt-secret>"
BLOB_READ_WRITE_TOKEN="<your-vercel-blob-token>"
PORT=3000
NODE_ENV=development
```

### 4️⃣ Database Migration

```bash
npx prisma migrate dev
```

### 5️⃣ Start the Server

```bash
npm run dev
```

The server will run at:  
👉 **http://localhost:3000**

---

## 🔑 API Endpoints

# 🔑 API Endpoints

## 🔐 Authentication

| Method | Endpoint                  | Description                         |
| ------ | ------------------------- | ----------------------------------- |
| POST   | `/api/auth/register`      | Register a new user                 |
| POST   | `/api/auth/login`         | Login and get tokens                |
| POST   | `/api/auth/refresh-token` | Refresh expired access token        |
| POST   | `/api/auth/logout`        | Logout and invalidate refresh token |

---

## 👤 Users

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| GET    | `/api/users`     | Get all users _(Admin only)_       |
| GET    | `/api/users/:id` | Get user by ID _(Admin & Manager)_ |
| DELETE | `/api/users/:id` | Delete user _(Admin only)_         |

---

## 🧾 Tasks

| Method | Endpoint         | Description                           |
| ------ | ---------------- | ------------------------------------- |
| POST   | `/api/tasks`     | Create a new task _(Admin & Manager)_ |
| GET    | `/api/tasks`     | Get all tasks (with filters)          |
| GET    | `/api/tasks/:id` | Get task by ID                        |
| PATCH  | `/api/tasks/:id` | Update task _(Admin & Manager)_       |
| DELETE | `/api/tasks/:id` | Delete task _(Admin & Manager)_       |

---

## 📎 Attachments

| Method | Endpoint                         | Description                 |
| ------ | -------------------------------- | --------------------------- |
| POST   | `/api/tasks/:taskId/attachments` | Upload attachment to a task |
| DELETE | `/api/attachments/:id`           | Delete attachment by ID     |

---

## 🧪 Running Tests

To run automated tests (if available):

```bash
npm test
```

---

## 🧩 Optional Additions

You may include:

-   🗂 **ERD Diagram / Database Schema** → `docs/ERD.pdf`
-   🔍 **Postman Collection** → `docs/Postman_Collection.json`
-   📘 **Swagger Documentation** (if implemented)

---

## 🧠 Evaluation Notes (Based on Assessment Document)

This project aligns with the **Backend Developer requirements** outlined by UPT TIK UNPER × PT Novatec Solution, covering:

-   ✅ Proper RESTful API design & HTTP status codes
-   ✅ Layered architecture (Controller–Service–Repository pattern)
-   ✅ Environment-based configuration management
-   ✅ JWT authentication with role-based access control (RBAC)
-   ✅ Rate limiting middleware to prevent brute-force attacks on auth routes
-   ✅ Transaction management and data consistency using Prisma ORM
-   ✅ CRUD operations for tasks and users
-   ✅ File upload and deletion via Vercel Blob integration
-   ✅ Centralized error handling with custom error classes
-   ✅ Unit and integration test readiness
-   ✅ Git best practices (conventional commits, branching, and documentation completeness)

---

## 👨‍💻 Author

**Tiswan**  
Backend Developer Candidate — UPT TIK UNPER × PT Novatec Solution 2025
