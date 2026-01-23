# Paystack Integration Troubleshooting Guide

## Common Error: "Invalid key"

If you're getting an "Invalid key" error from Paystack, follow these steps:

## Step 1: Verify Your Paystack Keys

### Where to Get Your Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
2. Make sure you're in **Test Mode** (toggle in top right)
3. Copy your **Secret Key** (starts with `sk_test_`)
4. Copy your **Public Key** (starts with `pk_test_`)

### Key Format Requirements

- **Secret Key**: Must start with `sk_test_` (for test mode) or `sk_live_` (for live mode)
- **Public Key**: Must start with `pk_test_` (for test mode) or `pk_live_` (for live mode)
- **No spaces**: Keys should not have any spaces before or after
- **No quotes**: Don't wrap keys in quotes in your `.env` file

## Step 2: Check Your .env File

Your `.env` file should look like this:

```env
PAYSTACK_SECRET_KEY=sk_test_1234567890abcdefghijklmnopqrstuvwxyz
PAYSTACK_PUBLIC_KEY=pk_test_1234567890abcdefghijklmnopqrstuvwxyz
```

### Common Mistakes:

❌ **Wrong - Has quotes:**
```env
PAYSTACK_SECRET_KEY="sk_test_1234567890abcdefghijklmnopqrstuvwxyz"
```

❌ **Wrong - Has spaces:**
```env
PAYSTACK_SECRET_KEY= sk_test_1234567890abcdefghijklmnopqrstuvwxyz
```

❌ **Wrong - Using Public Key instead of Secret Key:**
```env
PAYSTACK_SECRET_KEY=pk_test_1234567890abcdefghijklmnopqrstuvwxyz
```

✅ **Correct:**
```env
PAYSTACK_SECRET_KEY=sk_test_1234567890abcdefghijklmnopqrstuvwxyz
```

## Step 3: Restart Your Server

After updating your `.env` file:

1. **Stop the server** (Ctrl+C)
2. **Restart the server**:
   ```bash
   npm run dev
   ```

The server will now validate your keys on startup and show warnings if there are issues.

## Step 4: Verify Key is Loaded

Check your server startup logs. You should see:

```
✅ Environment variables validated
Server running on port 5000
```

If you see warnings about the key format, fix your `.env` file and restart.

## Step 5: Test the Key Manually

You can test if your Paystack key works by making a direct API call:

```bash
curl -X GET https://api.paystack.co/bank \
  -H "Authorization: Bearer YOUR_SECRET_KEY_HERE" \
  -H "Content-Type: application/json"
```

If your key is valid, you'll get a list of banks. If invalid, you'll get an error.

## Common Issues & Solutions

### Issue 1: "Invalid key" Error

**Possible Causes:**
- Key has extra spaces or characters
- Using Public Key instead of Secret Key
- Key is from wrong environment (test vs live)
- Key is expired or revoked

**Solution:**
1. Copy the key directly from Paystack dashboard (don't type it)
2. Remove any spaces or quotes
3. Ensure you're using the **Secret Key** (starts with `sk_`)
4. Verify you're in Test Mode if using `sk_test_`

### Issue 2: Key Not Found

**Error:** "PAYSTACK_SECRET_KEY is not set in environment variables"

**Solution:**
1. Check `.env` file exists in project root
2. Verify variable name is exactly `PAYSTACK_SECRET_KEY`
3. Restart server after adding the key

### Issue 3: Wrong Key Format

**Error:** "PAYSTACK_SECRET_KEY format is invalid"

**Solution:**
- Secret Key must start with `sk_test_` or `sk_live_`
- Check you copied the entire key (they're long!)
- Don't add any prefixes or suffixes

### Issue 4: Key Works in Dashboard but Not in API

**Possible Causes:**
- Using Public Key instead of Secret Key
- Key is for different environment
- Key has been regenerated but not updated in `.env`

**Solution:**
1. Regenerate keys in Paystack dashboard
2. Copy new Secret Key to `.env`
3. Restart server

## Verification Checklist

Before testing payments, verify:

- [ ] `.env` file exists in project root
- [ ] `PAYSTACK_SECRET_KEY` is set (no quotes, no spaces)
- [ ] Key starts with `sk_test_` (for test mode)
- [ ] Key is the full length (usually 64+ characters)
- [ ] Server restarted after updating `.env`
- [ ] No warnings in server startup logs
- [ ] Using Secret Key, not Public Key

## Testing Your Setup

Once configured correctly, test with:

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "email": "test@example.com"
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "reference": "PAY-...",
    "amount": 5000
  }
}
```

**If you still get "Invalid key":**
1. Double-check the key in Paystack dashboard
2. Regenerate the key in Paystack
3. Update `.env` with new key
4. Restart server
5. Try again

## Need More Help?

- Check Paystack API documentation: https://paystack.com/docs/api/
- Verify your Paystack account status
- Contact Paystack support if key continues to fail
