# Auth & Payments REST API

A production-inspired REST API built with Node.js, Express, and MongoDB that demonstrates secure authentication, role-based access control (RBAC), and Paystack payment integration.

<!-- ## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Payment Flow](#payment-flow)
- [Environment Variables](#environment-variables)
- [Testing the API](#testing-the-api)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)

---

## 🎯 Overview -->

This REST API provides:

- **User Authentication**: Secure registration and login with JWT tokens
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Payment Processing**: Integration with Paystack (test mode) for payment transactions
- **Transaction Management**: Persistent storage and retrieval of payment transactions

<!-- The system follows a **layered architecture** pattern for clear separation of concerns and maintainability.

---

## Features

- JWT-based authentication
- Password hashing with bcrypt (12 salt rounds)
- Role-based access control (Admin/User)
- Paystack payment integration (test mode)
- Transaction verification and storage
- Comprehensive error handling
- Input validation
- MongoDB with Mongoose ODM
- Clean, documented codebase

--- -->

## Tech Stack

### Core Technologies

- **Node.js** (LTS) - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Key Dependencies

- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing
- **axios** - HTTP client for Paystack API
- **dotenv** - Environment variable management

### Development Tools

- **nodemon** - Auto-reload during development

---

<!-- ## 📁 Project Structure

```
Payment-system/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection setup
│   ├── models/
│   │   ├── User.js              # User schema and methods
│   │   └── Transaction.js      # Transaction schema
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   └── paymentController.js # Payment logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── paymentRoutes.js     # Payment endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── role.js              # RBAC middleware
│   ├── utils/
│   │   ├── generateToken.js     # JWT token generation
│   │   ├── paystack.js          # Paystack API client
│   │   └── errorHandler.js      # Error handling utilities
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server bootstrap
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
``` -->

### Architecture Pattern

**Layered Architecture (MVC-inspired)**

```
Client Request (I've not implemented this yet.)
    ↓
Routes (HTTP layer)
    ↓
Middleware (Auth & RBAC)
    ↓
Controllers (Business logic)
    ↓
Models (Database layer)
    ↓
MongoDB
```

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Paystack account (for test keys)

### Installation Steps

1. **Clone or navigate to the project directory**

```bash
cd Payment-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/payments
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

**Important Notes:**
- Replace `JWT_SECRET` with a strong, random string
- Get your Paystack test keys from [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
- For MongoDB Atlas, use connection string format: `mongodb+srv://username:password@cluster.mongodb.net/payments`

4. **Start MongoDB**

If using local MongoDB:

```bash
# On Linux/Mac
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

5. **Run the application**

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

6. **Verify server is running**

Visit: `http://localhost:5000/health`

You should see:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

7. **Access Swagger Documentation**

Visit: `http://localhost:5000/api-docs`

This provides interactive API documentation where you can:
- View all endpoints with detailed descriptions
- Test endpoints directly in your browser
- See request/response examples
- Understand authentication flow

<!-- **See [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) for detailed instructions on using Swagger.** -->

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Auth Endpoints

#### 1. Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

- `400` - Validation error (missing fields, invalid email format, password too short)
- `409` - Email already registered

---

#### 2. Login User

**POST** `/api/auth/login`

Authenticate and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

- `400` - Missing email or password
- `401` - Invalid email or password

---

#### 3. Get Current User

**GET** `/api/auth/me`

Get authenticated user's information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `401` - No token provided or invalid token
- `404` - User not found

---

### Payment Endpoints

#### 1. Initialize Payment

**POST** `/api/payments/initiate`

Create a new payment transaction and get Paystack authorization URL.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "amount": 5000,
  "email": "customer@example.com"
}
```

**Note:** Amount is in **kobo** (smallest currency unit). For Naira, 5000 kobo = ₦50.00

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxx",
    "reference": "PAY-1704110400000-ABC123",
    "amount": 5000,
    "access_code": "xxxxx"
  }
}
```

**Error Responses:**

- `400` - Invalid amount
- `401` - Not authenticated
- `500` - Paystack API error

---

#### 2. Verify Payment

**GET** `/api/payments/verify/:reference`

Verify a payment transaction with Paystack and update status.

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `reference` - Transaction reference (e.g., `PAY-1704110400000-ABC123`)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Transaction verified successfully",
  "data": {
    "transaction": {
      "id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "amount": 5000,
      "reference": "PAY-1704110400000-ABC123",
      "status": "success",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "status": "success",
    "paystackStatus": "success"
  }
}
```

**Error Responses:**

- `400` - Missing reference
- `401` - Not authenticated
- `403` - Not authorized to verify this transaction
- `404` - Transaction not found
- `500` - Paystack API error

---

#### 3. Get My Transactions

**GET** `/api/payments/my-transactions`

Get all transactions for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "count": 2,
  "data": {
    "transactions": [
      {
        "id": "507f1f77bcf86cd799439011",
        "user": "507f1f77bcf86cd799439012",
        "amount": 5000,
        "reference": "PAY-1704110400000-ABC123",
        "status": "success",
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- `401` - Not authenticated

---

#### 4. Get All Transactions (Admin Only)

**GET** `/api/payments/all`

Get all transactions in the system. **Admin role required.**

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "count": 10,
  "data": {
    "transactions": [
      {
        "id": "507f1f77bcf86cd799439011",
        "user": {
          "id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "user"
        },
        "amount": 5000,
        "reference": "PAY-1704110400000-ABC123",
        "status": "success",
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- `401` - Not authenticated
- `403` - Admin role required

---

## Authentication

### How It Works

1. **Registration/Login**: User provides credentials
2. **Token Generation**: Server generates JWT token with user ID and role
3. **Token Storage**: Client stores token (localStorage, sessionStorage, etc.)
4. **Token Usage**: Client includes token in `Authorization: Bearer <token>` header
5. **Token Verification**: Middleware verifies token on protected routes

### Token Payload

```json
{
  "id": "userId",
  "role": "user"
}
```

### Token Expiration

Tokens expire after **7 days**. User must login again to get a new token.

---

## 👥 Authorization (RBAC)

### Roles

- **user**: Regular user (default role)
- **admin**: Administrator with elevated permissions

### Role Permissions

| Endpoint | User | Admin |
|----------|------|-------|
| Register | ✅ | ✅ |
| Login | ✅ | ✅ |
| Get Me | ✅ | ✅ |
| Initiate Payment | ✅ | ✅ |
| Verify Payment | ✅ | ✅ |
| My Transactions | ✅ | ✅ |
| All Transactions | ❌ | ✅ |

### How RBAC Works

1. **authMiddleware**: Verifies JWT and attaches user to `req.user`
2. **roleMiddleware**: Checks if user's role is in allowed roles list
3. **Access Denied**: Returns 403 if role doesn't match

---

## Payment Flow

### Complete Payment Process

1. **User Initiates Payment**
   ```
   POST /api/payments/initiate
   Body: { "amount": 5000, "email": "user@example.com" }
   ```

2. **Backend Creates Transaction**
   - Creates pending transaction in MongoDB
   - Calls Paystack `/transaction/initialize`
   - Returns authorization URL to frontend

3. **User Completes Payment**
   - Frontend redirects user to Paystack checkout
   - User enters payment details (test card)
   - Paystack processes payment

4. **Backend Verifies Payment**
   ```
   GET /api/payments/verify/:reference
   ```
   - Backend calls Paystack `/transaction/verify/:reference`
   - Updates transaction status (success/failed)
   - Stores Paystack response data

### Paystack Test Cards

Use these test cards in Paystack test mode:

- **Success**: `4084084084084081`
- **Declined**: `5060666666666666666`
- **Insufficient Funds**: `5060666666666666667`

CVV: Any 3 digits  
Expiry: Any future date  
PIN: Any 4 digits

---
<!-- 
## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/payments` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (test) | `sk_test_xxxxx` |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key (test) | `pk_test_xxxxx` |

--- -->

## Testing the API

### Recommended: Using Swagger UI (Easiest Method)

**Access Swagger Documentation:**
```
http://localhost:5000/api-docs
```

Swagger provides:
- Interactive API testing in your browser
- Complete endpoint documentation
- Request/response examples
- Built-in authentication
- No need for Postman or other tools

**Quick Start:**
1. Open `http://localhost:5000/api-docs` in your browser
2. Register a user using `POST /api/auth/register`
3. Copy the token from the response
4. Click "Authorize" button → Enter: `Bearer YOUR_TOKEN`
5. Test all protected endpoints!


### Using Postman/Thunder Client

1. **Register a User**
   ```
   POST http://localhost:5000/api/auth/register
   Body: { "name": "Test User", "email": "test@example.com", "password": "password123" }
   ```
   Copy the `token` from response

2. **Set Authorization Header**
   - In Postman: Authorization tab → Bearer Token
   - Paste the token

3. **Test Protected Endpoints**
   - Try `/api/auth/me`
   - Try `/api/payments/initiate`

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Me (with token):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Validation Errors

When validation fails, additional `errors` object is included:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": "Please provide a valid email address",
    "password": "Password must be at least 6 characters"
  }
}
```

---

