# Practical 7: Complete Implementation Guide

## ✅ Implementation Checklist

### Backend (Node.js + Express + MongoDB)
- [x] Install bcryptjs and jsonwebtoken packages
- [x] Create User schema with email and hashed password
- [x] Create authentication middleware for JWT verification
- [x] Create validation middleware for input validation
- [x] Implement /register endpoint (POST)
- [x] Implement /login endpoint (POST) with JWT token generation
- [x] Implement /me endpoint (GET) for user profile
- [x] Protect all task routes with authentication middleware
- [x] Implement authorization checks (users can only access their own tasks)
- [x] Add proper error handling and HTTP status codes

### Frontend (React + Vite)
- [x] Create AuthContext for managing authentication state
- [x] Create Login component with form validation
- [x] Create Register component with form validation
- [x] Create Logout functionality in Navbar
- [x] Update Tasks component to use authentication
- [x] Add token to Authorization header in API requests
- [x] Handle 401 errors and redirect to login
- [x] Update Navbar to show user email and logout button
- [x] Protect /tasks route from unauthenticated users

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally
- Backend server running on port 5000
- Frontend server running on port 5173 (Vite default)

### Step 1: Start MongoDB
Ensure MongoDB is running on your system:
```bash
# On Windows, if installed as service, it should be running
# Or manually start: mongod
```

### Step 2: Start Backend Server
The backend server should already be running. Verify:
```bash
cd backend
npm start
# Should show: "Connected to MongoDB" and "Server is running on port 5000"
```

### Step 3: Start Frontend Development Server
```bash
cd frontend
npm run dev
# Should show: "Local: http://localhost:5173/"
```

---

## 📖 Architecture Overview

### Authentication Flow
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─→ POST /register (email, password)
       │   └─→ Hash password with bcryptjs
       │   └─→ Save User to MongoDB
       │   └─→ Return 201 Created
       │
       ├─→ POST /login (email, password)
       │   └─→ Verify password with bcryptjs
       │   └─→ Generate JWT token (1 hour expiry)
       │   └─→ Return token + user info
       │
       └─→ Protected Requests (with Authorization header)
           └─→ Auth Middleware
           │   └─→ Extract token from header
           │   └─→ Verify JWT signature
           │   └─→ Set req.user with decoded data
           │
           └─→ Validation Middleware
           │   └─→ Check required fields
           │   └─→ Validate input format
           │
           └─→ Route Handler
               └─→ Process request
               └─→ Check user ownership (for updates/deletes)
               └─→ Return response
```

### Middleware Pipeline
```
Request
  ↓
[CORS Middleware]
  ↓
[Body Parser Middleware]
  ↓
[Authentication Middleware] (for protected routes)
  ├─ Verify token
  ├─ Extract user ID
  ├─ Set req.user
  ↓
[Validation Middleware]
  ├─ Check required fields
  ├─ Validate input format
  ↓
[Route Handler]
  ├─ Process business logic
  ├─ Check authorization
  ↓
Response
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey
1. **Register a new account**
   - Email: `john@example.com`
   - Password: `password123`
   - Expected: 201 Created, user data returned

2. **Login with credentials**
   - Email: `john@example.com`
   - Password: `password123`
   - Expected: 200 OK, JWT token received

3. **Create a task**
   - Authorization: `Bearer <token>`
   - Title: `Complete Practical 7`
   - Expected: 201 Created, task with userId

4. **Get all tasks**
   - Authorization: `Bearer <token>`
   - Expected: 200 OK, array with user's tasks only

5. **Update task**
   - Authorization: `Bearer <token>`
   - Update: `completed: true`
   - Expected: 200 OK, updated task

6. **Delete task**
   - Authorization: `Bearer <token>`
   - Expected: 200 OK, deletion confirmed

7. **Logout**
   - Action: Click logout button
   - Expected: Token removed, redirect to home

### Scenario 2: Error Handling
1. **Register with existing email**
   - Expected: 409 Conflict

2. **Login with wrong password**
   - Expected: 401 Unauthorized

3. **Access protected route without token**
   - Expected: 401 Unauthorized

4. **Access protected route with expired token**
   - Expected: 401 Token expired message

5. **Modify another user's task**
   - Expected: 403 Forbidden

6. **Create task with empty title**
   - Expected: 400 Bad Request

### Scenario 3: Token Expiration
1. **Login and receive token**
   - Token: Valid for 1 hour
   
2. **Wait for token to expire**
   - (In production, wait 1 hour or modify .env)
   
3. **Attempt to access protected route**
   - Expected: 401 Token expired, redirect to login

---

## 📋 Frontend Testing Checklist

### Authentication Pages
- [ ] Register page loads
- [ ] Email validation works
- [ ] Password validation (minimum 6 characters)
- [ ] Confirm password matching
- [ ] Successfully register new account
- [ ] Navigate to login after successful registration

- [ ] Login page loads
- [ ] Successfully login with credentials
- [ ] Navigate to tasks after successful login
- [ ] Error message on invalid credentials
- [ ] Link to register from login

### Task Management (Authenticated)
- [ ] Tasks page loads automatically when logged in
- [ ] Redirect to login when not authenticated
- [ ] Add new task
- [ ] View all tasks for current user
- [ ] Filter tasks (All, Completed, Pending)
- [ ] Mark task as completed
- [ ] Cannot mark completed task as pending
- [ ] Delete task
- [ ] Error handling for failed operations
- [ ] Logout button visible with user email
- [ ] Successfully logout and redirect

### Navigation
- [ ] Navbar shows Login/Register when not authenticated
- [ ] Navbar shows Logout and user email when authenticated
- [ ] Tasks link only visible when authenticated
- [ ] Navbar links highlight active page

### Error Cases
- [ ] Handle 401 errors (redirect to login)
- [ ] Display error messages from server
- [ ] Prevent form submission on validation errors
- [ ] Display loading states during async operations

---

## 🔐 Security Features Implemented

### Password Security
```javascript
// Bcryptjs hashing with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
```
- Never stored or returned in plain text
- Verified using `bcrypt.compare()` during login
- Minimum 6 characters enforced

### JWT Token Security
```javascript
// Token generation with expiration
const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);
```
- Tokens expire after 1 hour
- Signed with JWT_SECRET from environment
- Verified on every protected request
- Payload includes user ID for authorization checks

### Input Validation
- Server-side validation for all inputs
- Email format validation
- Password length requirements
- Task title non-empty validation
- Protection against empty/null values

### Authorization Checks
- Users can only see their own tasks
- Users can only modify their own tasks
- Users can only delete their own tasks
- 403 Forbidden returned for unauthorized access

---

## 🛠️ Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```
MongoDB connection failed: connect ECONNREFUSED
```
Solution: Ensure MongoDB is running locally on port 27017

**JWT_SECRET is missing**
```
JWT_SECRET is missing in the .env file.
```
Solution: Add JWT_SECRET to .env file

**MONGO_URI is missing**
```
MONGO_URI is missing in the .env file.
```
Solution: Add MONGO_URI to .env file

### Frontend Issues

**404 Not Found on API calls**
```
Failed to fetch /register (or other endpoint)
```
Solution: Ensure backend server is running on port 5000

**CORS Error**
```
Access to XMLHttpRequest blocked by CORS
```
Solution: Backend should have CORS enabled (already configured)

**Token not being sent in requests**
```
401 Unauthorized: No token provided
```
Solution: Check Authorization header in fetch requests

**Token expired error persists**
```
401 Token expired. Please login again.
```
Solution: Clear localStorage, logout, and login again

### Common Issues

**Can't create task after login**
- Verify token is being sent in Authorization header
- Check browser console for error messages
- Ensure backend server is running

**Can't see other users' tasks**
- This is intentional! Each user only sees their own tasks
- Verify you're viewing tasks for the correct user

**Forgot password**
- No password reset implemented (supplementary feature)
- Create new account with different email

---

## 📝 API Reference Summary

### Public Endpoints
- `POST /register` - Create new account
- `POST /login` - Get JWT token

### Protected Endpoints (require Authorization header)
- `GET /me` - Get current user profile
- `GET /tasks` - Get all tasks for current user
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Error Status Codes
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Unauthorized to access resource
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Email already registered

---

## 📚 Learning Outcomes Achieved

✅ **Password Hashing**: Implemented bcryptjs password hashing (salt rounds: 10)

✅ **JWT Generation**: Created JWT tokens with 1-hour expiration and user payload

✅ **Authentication Middleware**: Implemented token verification on protected routes

✅ **Authorization**: Ensured users can only access their own tasks

✅ **Input Validation**: Server-side validation for emails, passwords, and task titles

✅ **Error Handling**: Proper HTTP status codes for different error scenarios

✅ **Frontend Auth Flow**: Login → Register → Token Storage → Protected Routes

✅ **Session Management**: Automatic redirect to login on token expiration

---

## 🎯 Next Steps / Supplementary Features

These could be implemented for enhanced functionality:

1. **Password Reset**
   - Implement forgot password flow
   - Send reset email with token
   - Validate reset token and update password

2. **Email Verification**
   - Send verification email on registration
   - Prevent login until email verified
   - Resend verification email option

3. **Refresh Tokens**
   - Issue short-lived access token and long-lived refresh token
   - Implement token refresh endpoint
   - Rotate refresh tokens for security

4. **Rate Limiting**
   - Limit login attempts to prevent brute force
   - Limit API requests per user

5. **User Profile Updates**
   - Allow users to update their email
   - Allow users to change password
   - Allow users to update profile information

6. **Task Sharing**
   - Allow users to share tasks with other users
   - Implement task collaboration

7. **Admin Dashboard**
   - View all users
   - View all tasks
   - Manage user permissions
