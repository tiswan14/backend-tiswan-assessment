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
git clone https://github.com/tiswan14/backend-tiswan-assessment.git
cd backend-tiswan-assessment
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

# 📘 Detailed API Documentation

---

### 🔐 Auth Routes

#### **POST /api/auth/register**

Registers a new user (Admin, Manager, or User).

**Request Body**

```json
{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "12345678",
    "role": "ADMIN"
}
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **201** | User successfully registered | `{ "success": true, "message": "User registered successfully" }` |
| **400** | Invalid input (e.g., invalid email format) | `{ "success": false, "message": "Email must be valid" }` |
| **409** | Email already exists | `{ "success": false, "message": "Email already in use" }` |

---

#### **POST /api/auth/login**

Authenticates user and returns access and refresh tokens.

**Request Body**

```json
{
    "email": "admin@example.com",
    "password": "12345678"
}
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Login success | `{ "success": true, "token": "<access_token>", "refreshToken": "<refresh_token>" }` |
| **401** | Invalid credentials | `{ "success": false, "message": "Invalid email or password" }` |

---

#### **POST /api/auth/refresh-token**

Refreshes the access token using a valid refresh token.

**Request Body**

```json
{
    "refresh_token": "<refresh_token>"
}
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Token refreshed | `{ "success": true, "token": "<new_access_token>" }` |
| **401** | Invalid or expired token | `{ "success": false, "message": "Invalid refresh token" }` |

---

#### **POST /api/auth/logout**

Invalidates the user’s current refresh token.

**Headers**

```
Authorization: Bearer <token>
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Successfully logged out | `{ "success": true, "message": "Logout successful" }` |
| **401** | Invalid or missing token | `{ "success": false, "message": "Unauthorized" }` |

---

### 👥 Users Routes (Admin Only)

#### **GET /api/users**

Retrieves all registered users.

**Headers**

```
Authorization: Bearer <admin_token>
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | List of users | `{ "success": true, "data": [ { "id": "u1", "name": "Admin" } ] }` |
| **403** | Access denied | `{ "success": false, "message": "Access denied" }` |

---

#### **GET /api/users/:id**

Fetch a single user by ID.

**Headers**

```
Authorization: Bearer <token>
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | User found | `{ "success": true, "data": { "id": "u1", "name": "Admin" } }` |
| **404** | User not found | `{ "success": false, "message": "User not found" }` |

---

#### **DELETE /api/users/:id**

Deletes a user (Admin only).

**Headers**

```
Authorization: Bearer <admin_token>
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | User deleted successfully | `{ "success": true, "message": "User deleted successfully" }` |
| **403** | Non-admin user | `{ "success": false, "message": "Access denied" }` |
| **404** | User not found | `{ "success": false, "message": "User not found" }` |

---

### 🗾 Tasks Routes

#### **POST /api/tasks**

Creates a new task (Admin or Manager only).

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
    "title": "Design API Docs",
    "description": "Prepare backend documentation",
    "priority": "HIGH",
    "due_date": "2025-10-30T00:00:00Z",
    "assigned_to_id": "user123"
}
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **201** | Task created successfully | `{ "success": true, "message": "Task created successfully" }` |
| **400** | Missing or invalid field | `{ "success": false, "message": "Title is required" }` |
| **403** | Forbidden | `{ "success": false, "message": "Access denied" }` |

---

**Example Filter**

#### **GET /api/tasks?status=IN_PROGRESS&priority=HIGH**

#### **GET /api/tasks?assigned_to_id=user123**

Retrieves all tasks with filtering and pagination.

**Query Parameters**
| Name | Example | Description |
|-------|----------|-------------|
| `status` | `IN_PROGRESS` | Filter by task status |
| `priority` | `HIGH` | Filter by priority |
| `assigned_to_id` | `user123` | Filter by assignee |
| `limit` | `10` | Results per page (default 10) |
| `page` | `1` | Current page (default 1) |

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Tasks retrieved | `{ "success": true, "data": [ { "id": "t1", "title": "API Docs" } ] }` |

---

#### **GET /api/tasks/:id**

Retrieves a task by its ID.

**Headers**

```
Authorization: Bearer <token>
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Task found | `{ "success": true, "data": { "id": "t1", "title": "API Docs" } }` |
| **404** | Task not found | `{ "success": false, "message": "Task not found" }` |

---

#### **PATCH /api/tasks/:id**

Updates a task’s details or status.

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
    "status": "DONE"
}
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Task updated successfully | `{ "success": true, "message": "Task updated" }` |
| **403** | Forbidden | `{ "success": false, "message": "Access denied" }` |
| **404** | Task not found | `{ "success": false, "message": "Task not found" }` |

---

#### **DELETE /api/tasks/:id**

Deletes a task (Admin or Manager only).

**Headers**

```
Authorization: Bearer <token>
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Task deleted | `{ "success": true, "message": "Task deleted successfully" }` |
| **403** | Unauthorized | `{ "success": false, "message": "Access denied" }` |
| **404** | Task not found | `{ "success": false, "message": "Task not found" }` |

---

### 💎 Attachments Routes

#### **POST /api/tasks/:taskId/attachments**

Uploads an attachment for a task.

**Headers**

```
Authorization: Bearer <token>
```

**Form Data**
| Key | Type | Description |
|------|------|-------------|
| `file` | File | The file to be uploaded |

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **201** | File uploaded successfully | `{ "success": true, "message": "Attachment uploaded successfully" }` |
| **403** | Task completed or unauthorized | `{ "success": false, "message": "Cannot upload attachment. Task already completed." }` |
| **404** | Task not found | `{ "success": false, "message": "Task not found" }` |

---

#### **DELETE /api/attachments/:id**

Deletes an attachment by ID.

**Headers**

```
Authorization: Bearer <token>
```

**Responses**
| Status | Description | Example |
|---------|--------------|----------|
| **200** | Attachment deleted successfully | `{ "success": true, "message": "Attachment deleted successfully" }` |
| **403** | Forbidden | `{ "success": false, "message": "You are not allowed to delete this attachment." }` |
| **404** | Attachment not found | `{ "success": false, "message": "Attachment not found" }` |

---

````

---

### ⚙️ HTTP Status Code Summary

| Code                 | Meaning                  | Used In                         |
| -------------------- | ------------------------ | ------------------------------- |
| **200 OK**           | Request successful       | GET, PATCH, DELETE              |
| **201 Created**      | Resource created         | POST (register, create, upload) |
| **400 Bad Request**  | Invalid input            | Validation errors               |
| **401 Unauthorized** | Missing or invalid token | Auth routes                     |
| **403 Forbidden**    | Not enough permissions   | RBAC routes                     |
| **404 Not Found**    | Resource not found       | User, Task, Attachment          |
| **409 Conflict**     | Duplicate entry          | Register (email exists)         |

# 🧪 Automated Testing Guide

This project includes a complete **automated testing suite** to ensure code stability, API reliability, and database consistency across all environments.
Two primary test types are available:

- ✅ **Unit Tests** – Validate core logic and utility functions using **Jest**.
- 🔗 **Integration Tests** – Validate API endpoints, authentication, and database workflows using **Mocha**, **Chai**, **Supertest**, and **Mochawesome**.

---

## ⚙️ How to Run the Tests

Run the following commands from the project root:

```bash
# 🧩 Run Unit Tests (Jest)
npm run test:unit

# 🔗 Run Integration Tests with HTML report generation (Mocha)
npm run test:integration:full


---

## 🧩 Optional Additions

You may include:

-   🗂 **ERD Diagram / Database Schema** → `docs/ERD_Task_Management_API.png`
-   🔍 **Postman Collection** → `docs/Task_Management_API-Tiswan.postman_collection.json`

---

### 🧠 **Evaluation Notes (Based on Assessment Document)**

This project aligns with the **Backend Developer requirements** outlined by UPT TIK UNPER × PT Novatec Solution, covering:

-   ✅ Proper RESTful API design & HTTP status codes
-   ✅ Layered architecture (Controller–Service–Repository pattern)
-   ✅ Environment-based configuration management
-   ✅ JWT authentication with role-based access control (RBAC)
-   ✅ Rate limiting middleware to prevent brute-force attacks on auth routes
-   ✅ Transaction management and data consistency using Prisma ORM
-   ✅ CRUD operations for tasks and users
-   ✅ File upload and deletion via Vercel Blob integration
-   ✅ Task filtering by status, priority, and assigned user with pagination support (default limit 10, page 1)
-   ✅ Database indexing on foreign keys and query columns (`created_by_id`, `assigned_to_id`, `status`, `priority`, `task_id`) for optimized performance
-   ✅ Centralized error handling with custom error classes
-   ✅ Unit and integration test readiness
-   ✅ Git best practices (conventional commits, branching, and documentation completeness)

## 👨‍💻 Author

**Tiswan**
Backend Developer Candidate — UPT TIK UNPER × PT Novatec Solution 2025

```

```
````
