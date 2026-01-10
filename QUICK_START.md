# Quick Setup & Verification Guide

## 🚀 Quick Start (5 Minutes)

### **1. Backend Setup**

```bash
# Navigate to project root
cd /Users/kaniklchawla/Desktop/hack4delhi

# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your credentials
cat > .env << EOF
GROQ_API_KEY=your_groq_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
TWILIO_PHONE_NUMBER=+1234567890
EOF

# Test Groq API connection
python test_groq.py

# Start Flask backend
python app.py
# Server runs on http://localhost:5000
```

### **2. Frontend Setup**

```bash
# In new terminal, navigate to frontend
cd /Users/kaniklchawla/Desktop/hack4delhi/frontend

# Install Node dependencies (already done)
npm install

# Start Vite dev server
npm run dev
# Frontend runs on http://localhost:5175 (or next available port)
```

### **3. Ngrok Setup (For Outbound Calls)**

```bash
# In another terminal
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
# You'll use this as the webhook URL
```

### **4. Access the Dashboard**

- Open browser: `http://localhost:5175`
- Or the port shown by Vite dev server
- Login via Sidebar menu

---

## ✅ Verification Checklist

### **Backend Verification**

- [ ] `test_groq.py` runs successfully and connects to Groq
- [ ] `app.py` starts on port 5000 without errors
- [ ] `voice_agent.db` is created in root directory
- [ ] Flask shows "Running on http://localhost:5000"
- [ ] No errors in Flask console

**Test Backend**:
```bash
# In another terminal
curl http://localhost:5000/api/logs
# Should return JSON array of calls (empty initially)
```

### **Frontend Verification**

- [ ] `npm run dev` starts without errors
- [ ] Browser shows "AI Sathi" title in header
- [ ] Sidebar opens and closes
- [ ] Navigation buttons work (click each menu item)
- [ ] All pages load without console errors
- [ ] Tables display (empty until calls made)
- [ ] Responsive design works (resize browser)

**Check Frontend**:
```bash
# Open browser developer console (F12)
# Should see no errors in Console tab
# Network tab shows successful fetch to /api/logs
```

### **Integration Verification**

- [ ] Dashboard loads and shows stats (all zeros initially)
- [ ] Refresh buttons work
- [ ] Download logs button works (downloads CSV)
- [ ] Forms don't error on interaction
- [ ] Auto-refresh refreshes data

---

## 🧪 Test Your System

### **Test 1: Make a Test Call (Requires Twilio Account)**

1. Go to "Outbound Calls" page
2. Enter a test phone number (must be verified in Twilio)
3. Enter webhook URL from ngrok: `https://your-url.ngrok-free.app/voice`
4. Click "Initiate Calls"
5. Check table for the new call entry

### **Test 2: Simulate Inbound Call (Advanced)**

```bash
# Use curl to simulate Twilio webhook
curl -X POST http://localhost:5000/voice \
  -d "CallSid=CA123456789&From=%2B919999999999&To=%2B911234567890"

# Then visit Inbound Calls page to verify logging
```

### **Test 3: Check Database**

```bash
# View all calls in database
sqlite3 /Users/kaniklchawla/Desktop/hack4delhi/voice_agent.db

# In SQLite console
SELECT * FROM calls;
SELECT * FROM transcripts LIMIT 5;
.quit
```

---

## 📋 Component Status

### **Backend Components**

| Component | Status | Tested |
|-----------|--------|--------|
| Flask Server | ✅ Verified | Yes |
| SQLite DB | ✅ Verified | Yes |
| Groq API Integration | ✅ Verified | Yes (via test_groq.py) |
| Twilio Integration | ⚠️ Needs Credentials | No |
| Inbound Voice Handler | ✅ Implemented | No (needs live call) |
| Outbound Call Initiator | ✅ Implemented | No (needs live call) |
| Data Export | ✅ Implemented | Yes |

### **Frontend Components**

| Component | Status | Tested |
|-----------|--------|--------|
| App Router | ✅ Verified | Yes |
| Sidebar Navigation | ✅ Verified | Yes |
| Dashboard | ✅ Verified | Yes |
| InboundCalls Page | ✅ Verified | Yes |
| OutboundCalls Page | ✅ Verified | Yes |
| Queries Page | ✅ Verified | Yes |
| ContactInfo Page | ✅ Verified | Yes |
| Styling & Layout | ✅ Verified | Yes |
| Responsive Design | ✅ Verified | Yes |

---

## 🔧 Environment Requirements

### **Python**
```bash
python --version
# Should be 3.8 or higher
```

### **Node.js**
```bash
node --version
npm --version
# Node should be 16+ and npm should be 8+
```

### **Required API Keys**
1. **Groq**: Register at https://console.groq.com
2. **Twilio**: Create account at https://www.twilio.com
3. **Ngrok**: Download from https://ngrok.com (for local testing)

---

## 📖 Documentation Files

Created in this update:

1. **BACKEND_VERIFICATION.md** - Complete backend code review
2. **FRONTEND_GUIDE.md** - Frontend usage and customization guide
3. **QUICK_START.md** - This file

---

## 🐛 Common Issues & Fixes

### **Issue: "Port 5000 already in use"**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
# Then restart Flask
```

### **Issue: "GROQ_API_KEY not found"**
- Verify .env file exists in project root
- Check key is not expired
- Run: `python test_groq.py` to test

### **Issue: "Twilio credentials invalid"**
- Double-check SID and Token in Twilio console
- Make sure they match exactly (no spaces)
- Verify account is active and has credits

### **Issue: "Ngrok URL not working"**
- Make sure Flask backend is running on port 5000
- Check ngrok is running: `ngrok http 5000`
- Make sure you're using the HTTPS URL (not HTTP)

### **Issue: Frontend shows "Cannot connect to backend"**
- Verify Flask is running on port 5000
- Check browser console for CORS errors
- Make sure no firewall is blocking localhost:5000

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Dashboard, InboundCalls, OutboundCalls, etc)          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓ HTTP Requests
┌─────────────────────────────────────────────────────────┐
│                  Flask Backend                           │
│  (/voice, /api/logs, /make-call, etc)                   │
└──────────┬───────────┬─────────────────────────────────┘
           │           │
           ↓           ↓
    ┌──────────┐  ┌──────────────┐
    │ SQLite   │  │   Twilio     │
    │  DB      │  │   (Calls)    │
    └──────────┘  └──────────────┘
           │           │
           └─────┬─────┘
                 ↓
    ┌──────────────────────┐
    │   Groq LLaMA API     │
    │  (AI Responses)      │
    └──────────────────────┘
```

---

## 🎯 Next Steps

1. **Verify All Components**:
   - [ ] Run backend and frontend
   - [ ] Test all navigation
   - [ ] Check console for errors

2. **Get Credentials**:
   - [ ] Create Groq account and API key
   - [ ] Create Twilio account with phone number
   - [ ] Set up ngrok

3. **Make Test Call**:
   - [ ] Use Outbound Calls form
   - [ ] Monitor in Inbound/Dashboard
   - [ ] Download and review logs

4. **Customize**:
   - [ ] Update government contact info
   - [ ] Modify greeting messages
   - [ ] Adjust colors/branding

5. **Deploy**:
   - [ ] Run `npm run build` for production
   - [ ] Set up hosting
   - [ ] Configure SSL/HTTPS
   - [ ] Set up monitoring

---

## 📞 Support

If you encounter issues:

1. Check the error message carefully
2. Review relevant documentation file
3. Check browser console (F12 → Console tab)
4. Check Flask server output for errors
5. Verify all credentials in .env file
6. Test individual components in isolation

---

## ✅ Sign-Off Checklist

- [x] Backend code verified and documented
- [x] Frontend components created and styled
- [x] Navigation properly routed
- [x] Data flow implemented
- [x] Error handling in place
- [x] Responsive design working
- [x] Documentation comprehensive
- [x] Ready for testing with real calls
