# JWT Authentication Implementation Guide

## Overview
This guide explains how to use the implemented JWT-based authentication system for the Task Management application.

## Features Implemented
✅ User registration with password hashing (bcryptjs)
✅ User login with JWT token generation (1 hour expiry)
✅ Protected task routes with authentication middleware
✅ Server-side input validation for authentication and tasks
✅ User profile endpoint (/me)
✅ Authorization checks to ensure users only access their own tasks

## Environment Configuration
Make sure your `.env` file contains:
```
MONGO_URI=mongodb://localhost:27017/Practical_5
JWT_SECRET=your_jwt_secret_key_change_in_production_12345
PORT=5000
```

## API Endpoints

### Authentication Endpoints (Public)

#### 1. Register a New User
**POST** `/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation Rules:**
- Email is required and must be a valid string
- Password must be at least 6 characters long
- Email must be unique (409 error if already exists)

---

#### 2. Login User
**POST** `/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

**Error Cases:**
- 401: Invalid email or password
- 400: Validation error (missing or invalid email/password)

---

### Protected Endpoints (Require Authentication)

All task endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### 3. Get Current User Profile
**GET** `/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

#### 4. Get All Tasks for Logged-in User
**GET** `/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "task_id",
    "title": "Complete Practical 7",
    "completed": false,
    "userId": "user_id",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
]
```

---

#### 5. Create a New Task
**POST** `/tasks`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Complete Practical 7"
}
```

**Response (201 Created):**
```json
{
  "id": "task_id",
  "title": "Complete Practical 7",
  "completed": false,
  "userId": "user_id",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Validation:**
- Title is required and must be non-empty string

---

#### 6. Update a Task
**PUT** `/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "completed": true
}
```

**Response (200 OK):**
```json
{
  "id": "task_id",
  "title": "Updated Task Title",
  "completed": true,
  "userId": "user_id",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:05:00Z"
}
```

**Authorization:**
- 403: Task doesn't belong to the logged-in user

**Business Rules:**
- A completed task cannot be marked as pending
- Task title cannot be empty

---

#### 7. Delete a Task
**DELETE** `/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully",
  "task": {
    "id": "task_id",
    "title": "Deleted Task",
    "completed": false,
    "userId": "user_id",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:05:00Z"
  }
}
```

**Authorization:**
- 403: Task doesn't belong to the logged-in user

---

## Error Responses

### 401 Unauthorized
**No Token Provided:**
```json
{
  "message": "No token provided. Authorization denied."
}
```

**Invalid Token:**
```json
{
  "message": "Invalid token. Authorization denied."
}
```

**Token Expired:**
```json
{
  "message": "Token expired. Please login again."
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized: You can only modify your own tasks"
}
```

### 404 Not Found
```json
{
  "message": "Task not found"
}
```

### 409 Conflict
```json
{
  "message": "Email already registered"
}
```

---

## Testing with Postman

### Step 1: Register a User
1. Create a new **POST** request to `http://localhost:5000/register`
2. Set Headers: `Content-Type: application/json`
3. Add Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
4. Send and verify 201 response

### Step 2: Login
1. Create a new **POST** request to `http://localhost:5000/login`
2. Set Headers: `Content-Type: application/json`
3. Add Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
4. Send and **copy the token** from response

### Step 3: Create Task (Protected Route)
1. Create a new **POST** request to `http://localhost:5000/tasks`
2. Set Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <paste_your_token_here>`
3. Add Body:
```json
{
  "title": "My First Task"
}
```
4. Send and verify 201 response

### Step 4: Get All Tasks
1. Create a new **GET** request to `http://localhost:5000/tasks`
2. Set Headers:
   - `Authorization: Bearer <paste_your_token_here>`
3. Send and verify you see your created task

### Step 5: Get User Profile
1. Create a new **GET** request to `http://localhost:5000/me`
2. Set Headers:
   - `Authorization: Bearer <paste_your_token_here>`
3. Send and verify user details

### Step 6: Update Task
1. Create a new **PUT** request to `http://localhost:5000/tasks/<task_id>`
2. Set Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <paste_your_token_here>`
3. Add Body:
```json
{
  "title": "Updated Task",
  "completed": true
}
```
4. Send and verify response

### Step 7: Delete Task
1. Create a new **DELETE** request to `http://localhost:5000/tasks/<task_id>`
2. Set Headers:
   - `Authorization: Bearer <paste_your_token_here>`
3. Send and verify task is deleted

---

## Security Considerations

### Password Hashing
- Passwords are hashed using bcryptjs with salt rounds of 10
- Plain text passwords are never stored in the database
- Passwords are never returned in API responses

### JWT Token
- Tokens expire after 1 hour
- Tokens are signed with JWT_SECRET from environment
- Tokens contain user ID and email in the payload
- Invalid or expired tokens return 401 Unauthorized

### Authorization
- Each user can only see and modify their own tasks
- Attempting to modify another user's task returns 403 Forbidden
- All task endpoints verify token before processing request

### Input Validation
- Server-side validation for all inputs (email, password, title)
- Email validation happens before password hashing
- Task title validation prevents empty strings
- Password minimum length enforced (6 characters)

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally
- Check MONGO_URI in .env file
- Verify database name in connection string

### JWT_SECRET Missing Error
- Add JWT_SECRET to your .env file
- Restart the server after adding environment variable

### Token Expired Error
- Login again to get a fresh token
- Tokens expire after 1 hour by default

### Authorization Denied Errors
- Verify the token is included in Authorization header
- Ensure token format is `Bearer <token>`
- Check that the token hasn't expired

---

## Implementation Summary

### What Was Added:
1. **User Model** - Stores email and hashed password
2. **Authentication Middleware** - Verifies JWT tokens on protected routes
3. **Validation Middleware** - Validates input data server-side
4. **Register Endpoint** - Creates new users with hashed passwords
5. **Login Endpoint** - Authenticates users and generates JWT tokens
6. **Me Endpoint** - Returns current user's profile information
7. **Protected Task Routes** - All task routes now require authentication and verify user ownership

### Key Security Features:
- Password hashing with bcryptjs
- JWT-based stateless authentication
- Token expiration (1 hour)
- User-scoped task access
- Server-side input validation
- Proper HTTP status codes for error scenarios
