# Frontend Implementation Guide

## 🎨 Updated Frontend Architecture

### **Component Structure**

```
App.jsx (Main Router)
├── Sidebar.jsx (Navigation)
├── Dashboard.jsx (Overview & Statistics)
├── InboundCalls.jsx (Citizen call monitoring) ← NEW
├── OutboundCalls.jsx (Admin call management) ← NEW
├── Queries.jsx (Query logging)
└── ContactInfo.jsx (Government contact details)
```

### **Navigation System**

The sidebar now properly routes to different views:

| Menu Item | Route | Component | Purpose |
|-----------|-------|-----------|---------|
| Dashboard Home | `dashboard` | Dashboard | Overview & statistics |
| Inbound Logs | `inbound` | InboundCalls | Monitor citizen calls |
| Outbound Calls | `outbound` | OutboundCalls | Initiate admin calls |
| Queries & Docs | `queries` | Queries | Log & sync queries |
| Govt Contact Info | `contact` | ContactInfo | Display contact info |

---

## 📱 Component Breakdown

### **1. Dashboard.jsx (Overview)**

**Purpose**: High-level overview of system status and recent activity

**Features**:
- ✅ Guide card explaining the system
- ✅ 4 stat cards showing:
  - Total calls
  - Calls in last 24 hours
  - Inbound call count
  - Outbound call count
- ✅ Recent calls table (last 20 calls)
- ✅ Download all logs button
- ✅ Auto-refresh every 10 seconds

**Data Flow**:
```javascript
Dashboard
  ↓ fetchLogs()
  ↓ /api/logs
  ↓ Backend returns all 50 recent calls
  ↓ Display with statistics
```

---

### **2. InboundCalls.jsx (NEW)**

**Purpose**: Monitor and analyze citizen-initiated calls

**Features**:
- ✅ Detailed guide explaining inbound calls
- ✅ How it works (5-step flow)
- ✅ Key features list
- ✅ Call information captured
- ✅ 2 stat cards:
  - Total inbound calls
  - Calls in last 24 hours
- ✅ Complete inbound calls table with:
  - Call timestamp
  - From number (citizen's phone)
  - To number (government number)
  - Call SID (unique identifier)
  - Last message in conversation

**User Guide**:
```
When to use: Monitor who called the helpline and what they asked
How to interpret: 
  - High inbound volume = High citizen interest
  - Last message shows summary of their query
  - Click timestamp to see exact time
```

---

### **3. OutboundCalls.jsx (NEW)**

**Purpose**: Initiate and manage government-to-citizen calls

**Features**:
- ✅ Comprehensive guide with:
  - How to make calls (5 steps)
  - Required configuration explained
  - Ngrok setup instructions
  - Important security warnings
- ✅ Form to initiate calls with:
  - Phone numbers (multiline text area)
  - Custom message (optional greeting)
  - Ngrok webhook URL (required)
- ✅ Status messages (loading/success/error)
- ✅ Success details showing:
  - Numbers successfully called
  - Failed numbers with reasons
- ✅ 2 stat cards:
  - Total outbound calls
  - Calls in last 24 hours
- ✅ Outbound calls history table

**How to Use - Step by Step**:

1. **Get Ngrok URL**:
   ```bash
   # In terminal
   ngrok http 5000
   # Get URL like: https://abc123.ngrok-free.app
   ```

2. **Fill the Form**:
   - **Phone Numbers**: One per line or comma-separated
     ```
     +919999999999
     +918888888888
     +1234567890
     ```
   - **Custom Message** (optional): 
     ```
     "Namaskar, ye Government of India ka announcement hai..."
     ```
   - **Webhook URL**:
     ```
     https://abc123.ngrok-free.app/voice
     ```

3. **Click "Initiate Calls"**
4. **Monitor Results**:
   - Success: Shows green status with count
   - Error: Shows red status with details
   - Table updates with new calls

---

### **4. Queries.jsx**

**Purpose**: Log citizen queries and sync with Google Docs

**Features**:
- ✅ Query input textarea
- ✅ Auto-sync to Google Docs
- ✅ Status messages
- ✅ Clear after successful submission

---

### **5. ContactInfo.jsx**

**Purpose**: Display government contact information

**Features**:
- ✅ 6 contact information cards:
  - Organization
  - Address
  - Phone (with emergency number)
  - Email
  - Website
  - Working hours
- ✅ Service description
- ✅ Technical support information

---

## 🎨 Styling System

### **Color Palette**

```css
--navy: #000080          /* Primary color */
--saffron: #FF9933       /* Accent/Call-to-action */
--green: #138808         /* Success/Positive */
--light-navy: #F0F2FA    /* Light backgrounds */
--background: #F8FAFC    /* Page background */
```

### **Component Styling**

#### **Cards**
- White background with light border
- Rounded corners (12px)
- Subtle shadow on hover
- Header with icon + title

#### **Tables**
- Striped rows for readability
- Hover effect on rows
- Code blocks for call SIDs
- Status badges with colors

#### **Guide Cards**
- Light blue background
- Sections with left border (saffron)
- Lists with proper spacing
- Important sections highlighted in yellow

#### **Stat Cards**
- Icon with color gradient
- Large number display
- Clean label below
- Shadow on hover

---

## 📊 Data Flow Architecture

### **Inbound Call Flow**

```
Citizen calls helpline
    ↓
Twilio receives call → /voice endpoint
    ↓
System logs call with direction='Inbound'
    ↓
Asks for language selection
    ↓
/set-language → initializes session
    ↓
/handle-input receives speech
    ↓
Groq LLaMA API responds
    ↓
Response logged to database
    ↓
Played back to citizen
    ↓
InboundCalls.jsx fetches and displays
```

### **Outbound Call Flow**

```
Admin clicks "Initiate Calls"
    ↓
OutboundCalls.jsx submits form
    ↓
/make-call endpoint receives POST
    ↓
For each number, creates Twilio call
    ↓
Logs call with direction='Outbound'
    ↓
Calls webhook URL (ngrok tunnel)
    ↓
/voice endpoint processes call
    ↓
Citizen answers and hears message
    ↓
Conversation logged
    ↓
Table updates with results
```

---

## 🚀 How to Use the System

### **For Monitoring (Dashboard & Inbound)**

1. Open Dashboard Home
   - See overall statistics
   - Check recent activity
   - Review last 24 hours trends

2. Click "Inbound Logs"
   - See who called the helpline
   - View their queries
   - Check call timestamps
   - Monitor system usage

### **For Government Outreach (Outbound)**

1. Click "Outbound Calls" in sidebar
2. Read the guide section (important!)
3. Start ngrok tunnel: `ngrok http 5000`
4. Enter recipient phone numbers
5. (Optional) Add custom message/announcement
6. Paste ngrok webhook URL
7. Click "Initiate Calls"
8. Monitor status and results
9. Check historical calls in the table below

### **For Query Management**

1. Click "Queries & Docs"
2. Enter citizen query/grievance
3. Click "Save to Docs"
4. Automatically synced to Google Docs

### **For Contact Information**

1. Click "Govt Contact Info"
2. View all government contact details
3. Share with citizens as needed

---

## 🔄 Responsive Design

### **Desktop (> 1024px)**
- Sidebar always visible (280px)
- Full width content
- Side-by-side tables
- All information visible

### **Tablet (768px - 1024px)**
- Sidebar collapses to hamburger menu
- Content expands to full width
- Tables stack vertically
- Touch-friendly buttons

### **Mobile (< 768px)**
- Hamburger menu for sidebar
- Single column layout
- Full width forms
- Compact table display
- Larger touch targets

---

## 🛠️ Customization Guide

### **Changing Colors**

Edit in `App.css`:
```css
:root {
  --navy: #000080;        /* Change primary color */
  --saffron: #FF9933;     /* Change accent color */
  --green: #138808;       /* Change success color */
}
```

### **Modifying Sidebar Items**

Edit `Sidebar.jsx`:
```jsx
const menuItems = [
  { id: 'dashboard', label: 'Dashboard Home', icon: BarChart3 },
  // Add more items here
];
```

### **Changing Refresh Interval**

Edit in each component:
```jsx
const interval = setInterval(fetchLogs, 10000);  // Change 10000 to desired ms
```

### **Customizing Guide Text**

Edit the guide card sections in each component (InboundCalls, OutboundCalls, etc.)

---

## 📈 Performance Tips

1. **Reduce Auto-Refresh**:
   - Change 10000ms to 30000ms for slower refresh
   - Only refresh when needed

2. **Paginate Large Tables**:
   - Add pagination for > 100 calls
   - Load data on scroll

3. **Cache API Responses**:
   - Store responses locally
   - Update only on refresh

4. **Optimize Images**:
   - Use SVG for icons (already done)
   - Compress any images

---

## 🐛 Troubleshooting

### **Sidebar Not Opening**
- Check `sidebarOpen` state in App.jsx
- Verify onClick handlers connected

### **Calls Not Showing**
- Check `/api/logs` endpoint in backend
- Verify database contains data
- Check browser console for errors

### **Forms Not Submitting**
- Check webhook URL format
- Verify phone numbers in international format
- Check for console errors

### **Auto-refresh Not Working**
- Check if `setInterval` is called
- Verify `/api/logs` is responding
- Check component is not unmounted

---

## 📚 Additional Resources

- **Twilio Docs**: https://www.twilio.com/docs
- **Groq API**: https://console.groq.com/docs
- **React Docs**: https://react.dev
- **Lucide Icons**: https://lucide.dev

---

## ✅ Frontend Verification Checklist

- [x] All components created
- [x] Navigation properly routed
- [x] Styling complete and responsive
- [x] Data fetching working
- [x] Form submissions working
- [x] Status messages displaying
- [x] Tables rendering correctly
- [x] Mobile responsive
- [ ] Unit tests written (TODO)
- [ ] E2E tests written (TODO)
- [ ] Performance optimized (TODO)
- [ ] Accessibility audit done (TODO)

---

## 📝 Next Steps

1. **Test with Real Data**:
   - Make test calls
   - Verify logging
   - Check table updates

2. **Deploy**:
   - Run `npm run build`
   - Host on server
   - Configure SSL

3. **Monitor**:
   - Watch server logs
   - Check database growth
   - Monitor API costs

4. **Optimize**:
   - Gather user feedback
   - Optimize frequently used views
   - Add new features as needed
