#!/bin/bash

# API Testing Script
# This script helps you test all endpoints quickly

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "API Testing Script"
echo "=========================================="
echo ""

# Check if server is running
echo "1. Checking server health..."
HEALTH=$(curl -s http://localhost:5000/health)
if [[ $HEALTH == *"success"* ]]; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Please start the server first!${NC}"
    exit 1
fi
echo ""

# Test 1: Register User
echo "2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "password123"
  }')

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    EMAIL=$(echo $REGISTER_RESPONSE | grep -o '"email":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:50}..."
    echo "   Email: $EMAIL"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "   Response: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Login
echo "3. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\"
  }")

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo "4. Testing Get Current User..."
ME_RESPONSE=$(curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN")

if [[ $ME_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓ Get current user successful${NC}"
else
    echo -e "${RED}✗ Get current user failed${NC}"
    echo "   Response: $ME_RESPONSE"
fi
echo ""

# Test 4: Initialize Payment
echo "5. Testing Initialize Payment..."
PAYMENT_RESPONSE=$(curl -s -X POST $BASE_URL/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 5000,
    \"email\": \"$EMAIL\"
  }")

if [[ $PAYMENT_RESPONSE == *"authorization_url"* ]]; then
    echo -e "${GREEN}✓ Payment initialization successful${NC}"
    REFERENCE=$(echo $PAYMENT_RESPONSE | grep -o '"reference":"[^"]*' | cut -d'"' -f4)
    echo "   Reference: $REFERENCE"
else
    echo -e "${YELLOW}⚠ Payment initialization may have failed${NC}"
    echo "   Response: $PAYMENT_RESPONSE"
    REFERENCE=""
fi
echo ""

# Test 5: Verify Payment (if reference exists)
if [ ! -z "$REFERENCE" ]; then
    echo "6. Testing Verify Payment..."
    VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/payments/verify/$REFERENCE" \
      -H "Authorization: Bearer $TOKEN")
    
    if [[ $VERIFY_RESPONSE == *"success"* ]] || [[ $VERIFY_RESPONSE == *"pending"* ]]; then
        echo -e "${GREEN}✓ Payment verification successful${NC}"
    else
        echo -e "${YELLOW}⚠ Payment verification may have failed${NC}"
        echo "   Response: $VERIFY_RESPONSE"
    fi
    echo ""
fi

# Test 6: Get My Transactions
echo "7. Testing Get My Transactions..."
TRANSACTIONS_RESPONSE=$(curl -s -X GET $BASE_URL/payments/my-transactions \
  -H "Authorization: Bearer $TOKEN")

if [[ $TRANSACTIONS_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓ Get my transactions successful${NC}"
    COUNT=$(echo $TRANSACTIONS_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "   Transaction count: $COUNT"
else
    echo -e "${RED}✗ Get my transactions failed${NC}"
    echo "   Response: $TRANSACTIONS_RESPONSE"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "=========================================="
echo ""
echo "Your token for manual testing:"
echo "  $TOKEN"
echo ""
echo "Use this token in your requests:"
echo "  Authorization: Bearer $TOKEN"
