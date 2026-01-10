# 🔧 Setting Up Ngrok for Outbound Calls

## ✅ What's Done
- ngrok is installed on your machine
- Flask backend ready to run
- Frontend ready to use

## ⚠️ What's Needed
ngrok requires a free account to create tunnels. Here's how to set it up:

---

## 📋 Step 1: Sign Up for Ngrok (2 minutes)

1. Go to: https://ngrok.com/signup
2. Sign up with your email
3. Verify your email
4. Log in to your ngrok dashboard

---

## 📋 Step 2: Get Your Auth Token (1 minute)

1. Go to: https://dashboard.ngrok.com/auth/your-authtoken
2. Copy your authtoken (looks like: `1234567890abcdef_1234567890abcdef`)

---

## 📋 Step 3: Add Authtoken to Your Machine (1 minute)

```bash
# Run this command (replace YOUR_TOKEN with your actual token)
ngrok authtoken YOUR_TOKEN

# Example:
ngrok authtoken 1234567890abcdef_1234567890abcdef
```

That's it! You only need to do this once.

---

## 🚀 Step 4: Start Ngrok

Once authenticated, in a new terminal:

```bash
ngrok http 8000
```

You'll see output like:

```
Session Status                online
Account                       your-email@example.com
Version                       3.3.4
Region                        us
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8000
Forwarding                    http://abc123def456.ngrok-free.app -> http://localhost:8000
```

---

## 🎯 How to Use the Ngrok URL

1. Copy the HTTPS URL: `https://abc123def456.ngrok-free.app`
2. Go to **Outbound Calls** page in your dashboard
3. In the "Ngrok Webhook URL" field, paste: `https://abc123def456.ngrok-free.app/voice`
4. Fill in phone numbers and click "Initiate Calls"

---

## ⚡ Quick Setup Summary

```bash
# Step 1: Authenticate (one time only)
ngrok authtoken YOUR_TOKEN_HERE

# Step 2: Start ngrok (in a terminal)
ngrok http 8000

# Step 3: Copy the HTTPS URL shown
# Step 4: Use it in the Outbound Calls form with /voice at the end
```

---

## 💡 Pro Tips

- **Keep ngrok running**: Don't close the ngrok terminal while using the system
- **URL changes**: Each time you restart ngrok, you get a new URL
- **Paid plans**: For production, use ngrok paid plan for static URLs
- **Backend port**: Flask backend runs on port 8000 (not 5000 - macOS AirTunes uses 5000)
- **Local alternative**: While testing, you can use `http://localhost:8000/voice` if frontend and backend are on same machine

---

## ✅ Verification Steps

After setting up ngrok, verify everything works:

1. ✅ ngrok is running (see "Forwarding" lines pointing to port 8000)
2. ✅ Backend is running: `python app.py` (runs on http://localhost:8000)
3. ✅ Frontend is running: `npm run dev` in frontend folder
4. ✅ Open http://localhost:5175 in browser
5. ✅ Go to "Outbound Calls" page
6. ✅ Paste ngrok URL with /voice: `https://xyz.ngrok-free.app/voice`
7. ✅ Enter a test phone number
8. ✅ Click "Initiate Calls"

---

## 🐛 If ngrok won't start

**Error: "authentication failed"**
- You haven't set authtoken yet
- Run: `ngrok authtoken YOUR_TOKEN`

**Error: "port 8000 already in use"**
- Kill existing Flask process: `lsof -ti:8000 | xargs kill -9`
- Then start Flask again: `python app.py`

**Error: "command not found"**
- ngrok didn't install properly
- Run: `brew install ngrok`
- Then: `ngrok authtoken YOUR_TOKEN`

---

## 📞 Need Help?

1. Check ngrok status: Visit https://dashboard.ngrok.com/
2. Review docs: https://ngrok.com/docs
3. Common issues: https://ngrok.com/docs/errors/

---

**Next Step**: Set up your ngrok authtoken, then you're ready to test outbound calls! 🚀
