# Quick Setup Guide

This guide will help you get the API up and running quickly.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

1. Copy the environment template:
```bash
cp env.example .env
```

2. Edit `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/payments
JWT_SECRET=change_this_to_a_random_string_at_least_32_characters_long
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
```

**Important:**
- Generate a strong `JWT_SECRET` (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Get Paystack test keys from: https://dashboard.paystack.com/#/settings/developer

## Step 3: Start MongoDB

### Option A: Local MongoDB

```bash
# Linux
sudo systemctl start mongod

# Mac (with Homebrew)
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/payments
```

## Step 4: Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Step 5: Verify Installation

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Step 6: Test the API

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response.

### Test Protected Endpoint

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Creating an Admin User

By default, all registered users have the `user` role. To create an admin user:

1. Register a user normally
2. Connect to MongoDB:
```bash
mongosh payments
```

3. Update the user's role:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass to edit the user document directly.

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongosh` or `mongo`
- Check `MONGO_URI` in `.env` is correct
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use

- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000

### Paystack Errors

- Verify your Paystack test keys are correct
- Ensure you're using test keys (start with `sk_test_` and `pk_test_`)
- Check Paystack dashboard for API status

### JWT Errors

- Ensure `JWT_SECRET` is set in `.env`
- Use a strong, random secret (at least 32 characters)

## Next Steps

- Read the full [README.md](./README.md) for complete API documentation
- Test all endpoints using Postman or Thunder Client
- Review the code structure in `src/` directory

Happy coding! 🚀
