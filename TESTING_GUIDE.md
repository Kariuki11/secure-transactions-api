# Complete Testing Guide

This guide will walk you through testing every endpoint of the API step by step.

## Prerequisites

1. ✅ MongoDB is running (local or cloud)
2. ✅ Environment variables are set in `.env`
3. ✅ Dependencies are installed (`npm install`)
4. ✅ Server is running (`npm run dev` or `npm start`)

## Step 1: Verify Server is Running

**Test the health endpoint:**

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

✅ **If you see this, your server is running correctly!**

---

## Step 2: Test User Registration

**Register a new user:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (201):**
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

**⚠️ IMPORTANT:** Copy the `token` value - you'll need it for protected endpoints!

**Test Error Cases:**

1. **Missing fields:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```
Expected: 400 error with validation message

2. **Duplicate email:**
```bash
# Run the registration command again with same email
```
Expected: 409 error - "Email already registered"

3. **Invalid email format:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "password123"
  }'
```
Expected: 400 error - validation error

---

## Step 3: Test User Login

**Login with registered user:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
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

**⚠️ IMPORTANT:** Copy this new `token` - use it for subsequent requests!

**Test Error Cases:**

1. **Wrong password:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```
Expected: 401 error - "Invalid email or password"

2. **Non-existent user:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'
```
Expected: 401 error - "Invalid email or password"

---

## Step 4: Test Get Current User (Protected Endpoint)

**Replace `YOUR_TOKEN` with the token from login/register:**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200):**
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

**Test Error Cases:**

1. **No token:**
```bash
curl -X GET http://localhost:5000/api/auth/me
```
Expected: 401 error - "No token provided"

2. **Invalid token:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```
Expected: 401 error - "Invalid token"

---

## Step 5: Test Initialize Payment

**Initialize a payment transaction:**

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "email": "john@example.com"
  }'
```

**Note:** Amount is in **kobo** (smallest currency unit). 5000 kobo = ₦50.00

**Expected Response (200):**
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

**⚠️ IMPORTANT:** Copy the `reference` value - you'll need it for verification!

**Test Error Cases:**

1. **No token:**
```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}'
```
Expected: 401 error - "No token provided"

2. **Invalid amount:**
```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 0}'
```
Expected: 400 error - "Please provide a valid amount"

3. **Missing amount:**
```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```
Expected: 400 error

---

## Step 6: Test Verify Payment

**Verify a payment transaction:**

```bash
curl -X GET http://localhost:5000/api/payments/verify/PAY-1704110400000-ABC123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Replace `PAY-1704110400000-ABC123` with the actual reference from Step 5.**

**Expected Response (200):**
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

**Note:** If you haven't completed the payment on Paystack, the status might be "pending" or "failed".

**Test Error Cases:**

1. **Invalid reference:**
```bash
curl -X GET http://localhost:5000/api/payments/verify/INVALID_REF \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: 404 error - "Transaction not found"

2. **No token:**
```bash
curl -X GET http://localhost:5000/api/payments/verify/PAY-1704110400000-ABC123
```
Expected: 401 error

---

## Step 7: Test Get My Transactions

**Get all transactions for the authenticated user:**

```bash
curl -X GET http://localhost:5000/api/payments/my-transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
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

**Test Error Cases:**

1. **No token:**
```bash
curl -X GET http://localhost:5000/api/payments/my-transactions
```
Expected: 401 error

---

## Step 8: Test Get All Transactions (Admin Only)

**This endpoint requires admin role. First, create an admin user:**

### Create Admin User

1. Register a new user (or use existing)
2. Connect to MongoDB:
```bash
mongosh payments
```

3. Update user role to admin:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

4. Login as admin to get admin token

**Get all transactions (Admin only):**

```bash
curl -X GET http://localhost:5000/api/payments/all \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 5,
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

**Test Error Cases:**

1. **Regular user tries to access:**
```bash
curl -X GET http://localhost:5000/api/payments/all \
  -H "Authorization: Bearer USER_TOKEN"
```
Expected: 403 error - "Access denied. This route requires one of the following roles: admin"

2. **No token:**
```bash
curl -X GET http://localhost:5000/api/payments/all
```
Expected: 401 error

---

## Complete Test Flow Summary

Here's the complete flow to test everything:

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 3. Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. Get current user (use token from step 3)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Initialize payment (use token)
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"email":"test@example.com"}'

# 6. Verify payment (use reference from step 5)
curl -X GET http://localhost:5000/api/payments/verify/REFERENCE_HERE \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Get my transactions
curl -X GET http://localhost:5000/api/payments/my-transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Using Postman/Thunder Client

1. **Import the collection:**
   - Open Postman/Thunder Client
   - Import `API_COLLECTION.json`

2. **Set environment variables:**
   - Create a new environment
   - Add variable: `token` (leave empty initially)
   - Add variable: `baseUrl` = `http://localhost:5000/api`

3. **Test flow:**
   - Register → Copy token → Set `token` variable
   - Login → Update `token` variable
   - Test all other endpoints (they'll use the `token` variable automatically)

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution:** 
- Check MongoDB is running: `mongosh` or `mongo`
- Verify `MONGO_URI` in `.env` is correct
- For MongoDB Atlas, ensure IP is whitelisted

### Issue: Paystack Errors
**Solution:**
- Verify `PAYSTACK_SECRET_KEY` starts with `sk_test_`
- Check Paystack dashboard for API status
- Ensure you're using test mode keys

### Issue: JWT Errors
**Solution:**
- Verify `JWT_SECRET` is set in `.env`
- Ensure token is included in `Authorization: Bearer <token>` header
- Check token hasn't expired (7 days)

### Issue: Port Already in Use
**Solution:**
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000: `lsof -ti:5000 | xargs kill`

---

## Success Checklist

- [ ] Health endpoint returns success
- [ ] User registration works
- [ ] User login works
- [ ] Get current user works (with token)
- [ ] Initialize payment works (with token)
- [ ] Verify payment works (with token)
- [ ] Get my transactions works (with token)
- [ ] Get all transactions works (with admin token)
- [ ] Error handling works (401, 403, 404, etc.)

---

**Happy Testing! 🚀**
