# GuruJi Backend API - Postman Testing Guide

## Base URL

```
http://localhost:5000
```

---

## 1. Authentication Endpoints

### 1.1 User Signup

**Endpoint:** `POST /signup`  
**Auth Required:** No  
**Description:** Register a new user

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Response (400) - Email Already Exists:**

```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Error Response (400) - Missing Fields:**

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

---

### 1.2 User Login

**Endpoint:** `POST /login`  
**Auth Required:** No  
**Description:** Login with email and password

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Set-Cookie Header:**

```
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly
```

**Error Response (400) - Invalid Credentials:**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Error Response (400) - Missing Fields:**

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

---

### 1.3 User Logout

**Endpoint:** `GET /logout`  
**Auth Required:** No  
**Description:** Logout user and clear session

**Success Response (200):**

```
Logout Successful!!
```

---

## 2. Company Management Endpoints

### 2.1 Get All Companies

**Endpoint:** `GET /list`  
**Auth Required:** No  
**Description:** Get list of all companies

**Success Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tech Corp",
      "industry": "Technology",
      "location": "San Francisco, CA",
      "role": "Software Engineer",
      "experience": "2-3 years",
      "openings": 5,
      "logo_url": "https://example.com/logo.png",
      "apply_url": "https://example.com/apply",
      "description": "A leading tech company",
      "is_active": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Finance Solutions",
      "industry": "Finance",
      "location": "New York, NY",
      "role": "Data Analyst",
      "experience": "1-2 years",
      "openings": 3,
      "logo_url": null,
      "apply_url": "https://finance.example.com/careers",
      "description": "Global financial services company",
      "is_active": true
    }
  ]
}
```

---

### 2.2 Create Company

**Endpoint:** `POST /create`  
**Auth Required:** Yes (JWT Token in Cookie)  
**Description:** Create a new company posting

**Headers Required:**

```
Cookie: token=<YOUR_JWT_TOKEN>
```

**Request Body:**

```json
{
  "name": "NextGen Startup",
  "industry": "Artificial Intelligence",
  "location": "Austin, TX",
  "role": "AI/ML Engineer",
  "experience": "3+ years",
  "openings": 10,
  "logo_url": "https://example.com/nextgen-logo.png",
  "apply_url": "https://nextgen.example.com/apply",
  "description": "Building the future of AI. We're looking for talented engineers to join our growing team.",
  "is_active": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "NextGen Startup",
    "industry": "Artificial Intelligence",
    "location": "Austin, TX",
    "role": "AI/ML Engineer",
    "experience": "3+ years",
    "openings": 10,
    "logo_url": "https://example.com/nextgen-logo.png",
    "apply_url": "https://nextgen.example.com/apply",
    "description": "Building the future of AI. We're looking for talented engineers to join our growing team.",
    "is_active": true,
    "createdAt": "2024-01-15T11:45:00Z",
    "updatedAt": "2024-01-15T11:45:00Z"
  }
}
```

**Error Response (401) - Unauthorized (No Token):**

```json
{
  "message": "Please login"
}
```

**Error Response (400) - Missing Company Name:**

```json
{
  "success": false,
  "message": "Company name is required"
}
```

**Error Response (401) - Invalid Token:**

```json
{
  "message": "Invalid token"
}
```

---

### 2.3 Delete Company

**Endpoint:** `DELETE /delete/:id`  
**Auth Required:** Yes (JWT Token in Cookie)  
**Description:** Delete a company posting

**URL Parameter:**

```
:id = Company MongoDB ID (e.g., 507f1f77bcf86cd799439013)
```

**Headers Required:**

```
Cookie: token=<YOUR_JWT_TOKEN>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Company deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "NextGen Startup",
    "industry": "Artificial Intelligence"
  }
}
```

**Error Response (401) - Unauthorized (No Token):**

```json
{
  "message": "Please login"
}
```

**Error Response (404) - Company Not Found:**

```json
{
  "message": "Company not found"
}
```

**Error Response (401) - Invalid Token:**

```json
{
  "message": "Invalid token"
}
```

---

## Testing Steps in Postman

### Step 1: Register a User

1. Set Method: **POST**
2. URL: `http://localhost:5000/signup`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123"
}
```

5. Click **Send**

### Step 2: Login User

1. Set Method: **POST**
2. URL: `http://localhost:5000/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123"
}
```

5. Click **Send**
6. **Copy the token from Set-Cookie header** (or Postman will auto-manage it)

### Step 3: Get Company List

1. Set Method: **GET**
2. URL: `http://localhost:5000/list`
3. Click **Send** (no auth required)

### Step 4: Create a Company

1. Set Method: **POST**
2. URL: `http://localhost:5000/create`
3. Headers:
   - `Content-Type: application/json`
   - (Cookie with token should be auto-managed by Postman)
4. Body (raw JSON):

```json
{
  "name": "Innovation Labs",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "role": "Full Stack Developer",
  "experience": "2-3 years",
  "openings": 8,
  "logo_url": "https://example.com/logo.png",
  "apply_url": "https://innovation.example.com/careers",
  "description": "Join our fast-growing tech company building cutting-edge solutions",
  "is_active": true
}
```

5. Click **Send**

### Step 5: Delete Company

1. Set Method: **DELETE**
2. URL: `http://localhost:5000/delete/[COMPANY_ID]` (replace with actual company ID from create response)
3. Click **Send** (must be authenticated)

### Step 6: Logout

1. Set Method: **GET**
2. URL: `http://localhost:5000/logout`
3. Click **Send**

---

## Minimal Test Data (Copy-Paste Ready)

**Signup:**

```json
{ "email": "test@example.com", "password": "Test123" }
```

**Login:**

```json
{ "email": "test@example.com", "password": "Test123" }
```

**Create Company:**

```json
{
  "name": "Tech Company",
  "industry": "IT",
  "location": "NYC",
  "role": "Engineer",
  "experience": "2-3 years",
  "openings": 5,
  "apply_url": "https://example.com",
  "description": "Great company"
}
```

---

## Notes

- JWT token is stored in cookies automatically
- All protected endpoints require valid login token
- Company ID (MongoDB ObjectId) is returned in responses
- Postman will handle cookies automatically in subsequent requests
