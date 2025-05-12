# P_squre Backend API Documentation

## Overview
This is the backend API for the P_squre application, which provides authentication and candidate management functionalities.

## Base URL
```
/api
```

## Authentication Routes

### Register a New User
- **Route:** `POST /api/auth/register`
- **Access:** Public
- **Description:** Register a new user in the system

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // Optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jsonwebtokenstring"
}
```

**Possible Errors:**
- 400: "Please provide a name, email and password"
- 400: Email already exists

### Login User
- **Route:** `POST /api/auth/login`
- **Access:** Public
- **Description:** Login an existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jsonwebtokenstring"
}
```

**Possible Errors:**
- 400: "Please provide an email and password"
- 401: "Invalid credentials"

### Logout User
- **Route:** `GET /api/auth/logout`
- **Access:** Public
- **Description:** Logout a user

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

### Get Current User Profile
- **Route:** `GET /api/auth/me`
- **Access:** Private (requires token)
- **Description:** Get the currently logged in user's data

**Headers Required:**
```
Authorization: Bearer [token]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-05-11T12:00:00.000Z"
  }
}
```

## Candidate Routes
All candidate routes require authentication. Include the token in the request header.

**Headers Required for All Routes:**
```
Authorization: Bearer [token]
```

### Get All Candidates
- **Route:** `GET /api/candidates`
- **Access:** Private
- **Description:** Get all candidates with optional filtering, sorting, and pagination

**Query Parameters:**
- `select` - Fields to select (comma separated)
- `sort` - Fields to sort by (comma separated)
- `page` - Page number
- `limit` - Number of results per page
- Additional filter parameters (any candidate field)

**Advanced Filtering:**
- `gt` - Greater than
- `gte` - Greater than or equal to
- `lt` - Less than
- `lte` - Less than or equal to
- `in` - In array

**Examples:**
- `/api/candidates?status=ongoing`
- `/api/candidates?experience[gte]=2&sort=-createdAt`
- `/api/candidates?select=full_name,email,status&page=2&limit=10`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "next": { "page": 2, "limit": 25 },
    "prev": { "page": 0, "limit": 25 }
  },
  "data": [
    {
      "_id": "candidate_id",
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "status": "ongoing",
      "position": "Developer",
      "experience": 3,
      "resume_URL": "resume_url",
      "notes": "Promising candidate",
      "interviewDate": "2023-05-20T10:00:00.000Z",
      "createdAt": "2023-05-11T12:00:00.000Z",
      "createdBy": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    // More candidates...
  ]
}
```

### Get Candidates by Status
- **Route:** `GET /api/candidates/status/:status`
- **Access:** Private
- **Description:** Get candidates filtered by status

**Route Parameters:**
- `status` - One of: "rejected", "ongoing", "selected", "scheduled"

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      // Candidate object (same format as above)
    },
    // More candidates...
  ]
}
```

**Possible Errors:**
- 400: "Invalid status. Valid statuses are: rejected, ongoing, selected, scheduled"

### Get Candidates by Position
- **Route:** `GET /api/candidates/position/:position`
- **Access:** Private
- **Description:** Get candidates filtered by position (case insensitive search)

**Route Parameters:**
- `position` - One of: "Developer", "Designer", "HR" (case insensitive)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      // Candidate object (same format as above)
    },
    // More candidates...
  ]
}
```

**Possible Errors:**
- 400: "Invalid position. Valid positions are: Developer, Designer, HR"

### Get Single Candidate
- **Route:** `GET /api/candidates/:id`
- **Access:** Private
- **Description:** Get single candidate by ID

**Route Parameters:**
- `id` - Candidate ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "candidate_id",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "status": "ongoing",
    "position": "Developer",
    "experience": 3,
    "resume_URL": "resume_url",
    "notes": "Promising candidate",
    "interviewDate": "2023-05-20T10:00:00.000Z",
    "createdAt": "2023-05-11T12:00:00.000Z",
    "createdBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Possible Errors:**
- 404: "Candidate not found with id of [id]"

### Create New Candidate
- **Route:** `POST /api/candidates`
- **Access:** Private
- **Description:** Create a new candidate

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "status": "ongoing", // Optional, defaults to "ongoing"
  "position": "Developer", // Must be one of: "Developer", "Designer", "HR"
  "experience": 3, // Optional, defaults to 0
  "resume_URL": "resume_url", // Optional
  "notes": "Promising candidate", // Optional
  "interviewDate": "2023-05-20T10:00:00.000Z" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_candidate_id",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "status": "ongoing",
    "position": "Developer",
    "experience": 3,
    "resume_URL": "resume_url",
    "notes": "Promising candidate",
    "interviewDate": "2023-05-20T10:00:00.000Z",
    "createdAt": "2023-05-11T12:00:00.000Z",
    "createdBy": "user_id"
  }
}
```

**Possible Errors:**
- 400: Validation errors (missing required fields, invalid email, etc.)
- 400: Invalid position

### Update Candidate
- **Route:** `PUT /api/candidates/:id`
- **Access:** Private
- **Description:** Update a candidate by ID

**Route Parameters:**
- `id` - Candidate ID

**Request Body:**
Any fields that need to be updated (same format as create)

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated candidate object
  }
}
```

**Possible Errors:**
- 404: "Candidate not found with id of [id]"
- 400: Validation errors
- 403: "Only admins can change candidate status" (if non-admin tries to update status)

### Update Candidate Status (Admin Only)
- **Route:** `PUT /api/candidates/:id/status`
- **Access:** Private (Admin only)
- **Description:** Update a candidate's status by ID (admin specific route)

**Route Parameters:**
- `id` - Candidate ID

**Request Body:**
```json
{
  "status": "scheduled" // One of: "rejected", "ongoing", "selected", "scheduled"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated candidate object
  }
}
```

**Possible Errors:**
- 403: "Only admins can update candidate status"
- 404: "Candidate not found with id of [id]"
- 400: "Invalid status. Valid statuses are: rejected, ongoing, selected, scheduled"

### Delete Candidate
- **Route:** `DELETE /api/candidates/:id`
- **Access:** Private
- **Description:** Delete a candidate by ID

**Route Parameters:**
- `id` - Candidate ID

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

**Possible Errors:**
- 404: "Candidate not found with id of [id]"

## Data Models

### User Model
```
{
  name: String (required),
  email: String (required, unique, valid email format),
  password: String (required, min 6 characters, not returned in responses),
  role: String (enum: 'user', 'admin', default: 'user'),
  createdAt: Date (default: Date.now)
}
```

### Candidate Model
```
{
  full_name: String (required),
  email: String (required, unique, valid email format),
  status: String (enum: 'rejected', 'ongoing', 'selected', 'scheduled', default: 'ongoing'),
  position: String (enum: 'Developer', 'Designer', 'HR', required),
  experience: Number (default: 0),
  resume_URL: String (optional),
  notes: String (optional),
  interviewDate: Date (optional),
  createdAt: Date (default: Date.now),
  createdBy: ObjectId (reference to User, required)
}
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer [token]
```

Tokens are obtained by registering or logging in, and they expire based on the JWT_EXPIRE environment variable setting.