# 🚀 Complete Deployment Guide: Vercel + Render

Deploy your AI Sathi system to production with **Vercel (frontend)** and **Render (backend)**.

---

## 📋 Pre-Deployment Checklist

Before you start, ensure you have:
- [ ] GitHub account with repo pushed
- [ ] Vercel account (free at vercel.com)
- [ ] Render account (free at render.com)
- [ ] Twilio account with credentials
- [ ] Groq API key
- [ ] All environment variables ready

---

# PART 1: Deploy Frontend to Vercel

## Step 1: Fix Environment Variables in Frontend

### 1.1 Create configuration file

Create `frontend/src/config.js`:

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

### 1.2 Update all frontend components to use API_URL

**Files to update:**
- `frontend/src/components/Dashboard.jsx`
- `frontend/src/components/InboundCalls.jsx`
- `frontend/src/components/OutboundCalls.jsx`
- `frontend/src/components/Queries.jsx`

**Replace all hardcoded URLs** like:

```javascript
// BEFORE:
fetch('http://localhost:8000/api/logs')

// AFTER:
import { API_URL } from '../config'
fetch(`${API_URL}/api/logs`)
```

### 1.3 Create environment variable files

**Create `frontend/.env.example`** (commit to GitHub):
```
VITE_API_URL=http://localhost:8000
```

**Create `frontend/.env.local`** (for local development, don't commit):
```
VITE_API_URL=http://localhost:8000
```

**Create `frontend/.env.production`** (for production, don't commit):
```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

### 1.4 Update vite.config.js

Remove or comment out the proxy configuration:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Remove the server proxy configuration - use environment variables instead
})
```

## Step 2: Create Vercel Configuration

Create `vercel.json` at project root:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
```

## Step 3: Test Locally

```bash
# Make sure frontend builds correctly
cd /Users/kaniklchawla/Desktop/hack4delhi/frontend
npm run build

# Should see: ✓ 224 modules transformed
# No errors expected
```

## Step 4: Push to GitHub

```bash
cd /Users/kaniklchawla/Desktop/hack4delhi
git add .
git commit -m "Fix environment variables for Vercel deployment"
git push origin main
```

## Step 5: Deploy to Vercel

### 5.1 Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repo `kanikchawla/hack4delhi`
4. Click "Import"

### 5.2 Configure Project Settings
- **Project Name**: hack4delhi (or custom name)
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install` (will run in frontend)

### 5.3 Set Environment Variables
Before deploying, add in **Environment Variables** section:

```
VITE_API_URL = [LEAVE BLANK FOR NOW - will set after backend deploys]
```

Or set to ngrok URL temporarily:
```
VITE_API_URL = https://your-ngrok-url.ngrok-free.app
```

### 5.4 Deploy
Click "Deploy" button

✅ **Your frontend is now live!** You'll get a URL like:
```
https://hack4delhi.vercel.app
```

---

# PART 2: Deploy Backend to Render

## Step 1: Prepare Backend for Render

### 1.1 Update app.py for Render

Render requires specific configuration. Update `app.py`:

Find this line (around line 350):
```python
if __name__ == "__main__":
    app.run(debug=False, port=5000)
```

Replace with:
```python
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### 1.2 Update CORS for Production

Find the CORS setup (around line 20):
```python
CORS(app)
```

Replace with:
```python
CORS(app, origins=[
    "http://localhost:5175",           # Local development
    "http://localhost:3000",           # Alternative local
    "https://hack4delhi.vercel.app",   # Your Vercel frontend
    "https://*.vercel.app"             # Any Vercel deployment
])
```

Or keep it simple (allow all for now):
```python
CORS(app)  # Allow all origins
```

### 1.3 Create Render config file

Create `render.yaml` at project root:

```yaml
services:
  - type: web
    name: hack4delhi-backend
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: PORT
        value: 5000
      - key: TWILIO_ACCOUNT_SID
        sync: false
      - key: TWILIO_AUTH_TOKEN
        sync: false
      - key: TWILIO_PHONE_NUMBER
        sync: false
      - key: GROQ_API_KEY
        sync: false
```

### 1.4 Update .gitignore to allow database for Render

Add to `.gitignore`:
```
# Allow database to be tracked (Render will regenerate on each deploy)
# *.db
```

Or keep it as is (database will be recreated on each deploy, which is fine for testing).

## Step 2: Push Updated Code to GitHub

```bash
cd /Users/kaniklchawla/Desktop/hack4delhi
git add app.py render.yaml vercel.json
git commit -m "Configure for Vercel and Render deployment"
git push origin main
```

## Step 3: Create PostgreSQL Database (Optional but Recommended)

For production, you should use PostgreSQL instead of SQLite.

### Create Render PostgreSQL
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Name: `hack4delhi-db`
4. Database: `hack4delhi`
5. User: `hack4delhi_user`
6. Click "Create Database"
7. Copy the **Internal Database URL**

### Update requirements.txt

Add PostgreSQL support:
```bash
cd /Users/kaniklchawla/Desktop/hack4delhi
echo "psycopg2-binary==2.9.9" >> requirements.txt
echo "sqlalchemy==2.0.23" >> requirements.txt
git add requirements.txt
git commit -m "Add PostgreSQL dependencies"
git push origin main
```

## Step 4: Deploy Backend to Render

### 4.1 Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select repository: `kanikchawla/hack4delhi`
5. Click "Connect"

### 4.2 Configure Web Service
- **Name**: hack4delhi-backend
- **Region**: Singapore (or closest to you)
- **Branch**: main
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python app.py`
- **Plan**: Free

### 4.3 Set Environment Variables

Click "Advanced" → "Environment Variables"

Add each variable (get values from your `.env` file):

```
TWILIO_ACCOUNT_SID = your_actual_sid
TWILIO_AUTH_TOKEN = your_actual_token
TWILIO_PHONE_NUMBER = +91your_number
GROQ_API_KEY = your_groq_api_key
DATABASE_URL = [if using PostgreSQL, add the URL here]
PORT = 5000
```

### 4.4 Deploy
Click "Create Web Service"

Render will start building. Wait 2-3 minutes for deployment.

✅ **Your backend is now live!** You'll get a URL like:
```
https://hack4delhi-backend.onrender.com
```

---

# PART 3: Connect Frontend & Backend

## Step 1: Update Frontend Environment Variables

### In Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project: `hack4delhi`
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   ```
   VITE_API_URL = https://hack4delhi-backend.onrender.com
   ```
5. Click "Save"

### Trigger Redeployment:
The project will automatically redeploy with the new environment variable.

Or manually:
1. Go to **Deployments**
2. Click the three dots on latest deployment
3. Select "Redeploy"

## Step 2: Test Connection

1. Open your Vercel frontend: https://hack4delhi.vercel.app
2. Go to **Dashboard** page
3. Click "Refresh" button
4. You should see call logs (or empty if no calls made yet)
5. Try **Download Logs** button - should work now

## Step 3: Setup Ngrok for Outbound Calls

For outbound calls to work, you need ngrok:

### On Your Local Machine:

```bash
# Authenticate ngrok
ngrok authtoken YOUR_AUTHTOKEN

# Start ngrok to tunnel to Render backend
ngrok http https://hack4delhi-backend.onrender.com
```

Or if you want to use Render's webhook directly (easier):

Just use the Render URL as webhook:
```
https://hack4delhi-backend.onrender.com/voice
```

---

# PART 4: Final Verification

## ✅ Checklist

### Frontend (Vercel)
- [ ] Project deployed and accessible
- [ ] Frontend loads without errors
- [ ] Can navigate between pages
- [ ] All icons and styling display correctly

### Backend (Render)
- [ ] Backend deployed and accessible
- [ ] Can access `/api/logs` endpoint
- [ ] Database is initialized
- [ ] Twilio credentials configured

### Connection
- [ ] Frontend can fetch from backend
- [ ] Download logs works
- [ ] No CORS errors in browser console

### Testing
- [ ] Make a test outbound call
- [ ] Verify call logs appear in dashboard
- [ ] Download logs as CSV
- [ ] Check Render logs for any errors

---

# PART 5: Troubleshooting

## Frontend Issues

### 502 Bad Gateway or Can't Connect to Backend
**Problem**: Frontend can't reach backend URL

**Solution**:
```bash
# Check environment variables in Vercel dashboard
# Make sure VITE_API_URL is set correctly
# Redeploy: Settings → Deployments → Redeploy

# Check browser console for CORS errors
# If CORS error, update CORS in app.py
```

### Build Fails on Vercel
**Problem**: npm run build fails

**Solution**:
```bash
# Test locally first
cd frontend
npm run build

# If it works locally but fails on Vercel:
# 1. Check Vercel build logs for specific error
# 2. Make sure Node version matches
# 3. Check for missing dependencies
```

## Backend Issues

### Backend Won't Start on Render
**Problem**: Build succeeds but start command fails

**Solution**:
1. Check Render logs for error message
2. Verify all environment variables are set
3. Check if port is being used

```bash
# View Render logs:
# Dashboard → Select service → Logs tab
```

### CORS Error When Making API Calls
**Problem**: Browser blocks requests from frontend

**Solution**:
Update CORS in `app.py`:
```python
CORS(app, origins=[
    "https://hack4delhi.vercel.app",
    "http://localhost:5175"
])
```

Then redeploy to Render.

### Database Connection Error
**Problem**: Can't connect to database

**Solution**:
1. Check DATABASE_URL environment variable
2. Verify PostgreSQL is running (if using PostgreSQL)
3. Check credentials are correct

---

# PART 6: Going Live Checklist

## Before Production

- [ ] Update all hardcoded URLs to environment variables
- [ ] Set secure CORS origins (not allow *)
- [ ] Add authentication to admin dashboard
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable HTTPS everywhere
- [ ] Add error logging/monitoring
- [ ] Update README with deployment info
- [ ] Document all environment variables
- [ ] Set up automated tests

## Production Deployment

- [ ] Test all features end-to-end
- [ ] Verify phone number validation
- [ ] Check Twilio usage and costs
- [ ] Monitor error rates
- [ ] Set up alerts for failures
- [ ] Document rollback procedure
- [ ] Brief team on live system

---

# PART 7: Post-Deployment

## Monitor Your System

### Vercel Analytics
- Dashboard → Settings → Analytics
- Track frontend performance
- Monitor deploy times

### Render Logs
- Service page → Logs
- Monitor errors
- Check API response times

### Twilio Console
- Monitor call usage and costs
- Check for failed calls
- Review call quality

---

# Quick Reference URLs

After deployment, your system will be accessible at:

```
🌐 Frontend:  https://hack4delhi.vercel.app
🔧 Backend:   https://hack4delhi-backend.onrender.com
📞 Voice:     https://hack4delhi-backend.onrender.com/voice
📥 Logs API:  https://hack4delhi-backend.onrender.com/api/logs
```

---

# Environment Variables Reference

### Frontend (Vercel)
```
VITE_API_URL=https://hack4delhi-backend.onrender.com
```

### Backend (Render)
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+919876543210
GROQ_API_KEY=your_api_key
DATABASE_URL=postgresql://user:pass@host/db  # If using PostgreSQL
PORT=5000
```

---

# Support & Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Vite Guide**: https://vitejs.dev/guide/
- **Flask Deployment**: https://flask.palletsprojects.com/en/latest/deploying/
- **Twilio Voice**: https://www.twilio.com/docs/voice

---

**Your AI Sathi system is now ready for production! 🎉**

Have questions? Check the troubleshooting section or review the logs on each platform.
