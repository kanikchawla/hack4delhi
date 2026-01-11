# Government of India - Caller 🎙️

A fully functional AI Voice Agent that handles **Inbound** and **Outbound** calls using **Twilio** and **Groq (Llama 3)**. Features a modern React frontend with sophisticated UI, supports multilingual conversations (Hindi/English), and includes enhanced AI prompts with 2024-2025 government information and boundary constraints.

## 🚀 Quick Setup

### Backend Setup

1. **Install Python Dependencies**
```bash
cd hack4delhi-main
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure Environment Variables**
Create a `.env` file with your keys:
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number
GROQ_API_KEY=your_groq_key
```

3. **Run the Flask Backend**
```bash
python3 app.py
```
> Backend API runs at `http://localhost:5000`

### Frontend Setup

1. **Install Node Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```
> Frontend will be available at `http://localhost:5173`

### Expose to Internet (for Twilio Webhooks)

You need `ngrok` to let Twilio talk to your local server:
```bash
ngrok http 8000
```
Copy the webhook URL (e.g., `https://abc.ngrok-free.app`) and:
1. Go to Twilio Console > Phone Numbers
2. Paste URL + `/voice` in the **Webhook** field (Example: `https://abc.ngrok-free.app/voice`)

## 🌟 Features

### Frontend
*   **Modern React UI**: Sophisticated sidebar navigation with responsive design
*   **Admin Dashboard**: Real-time call logs, inbound/outbound tracking, and call management
*   **Contact Information**: Comprehensive Government of India contact details
*   **Beautiful Design**: Modern CSS with smooth animations and professional styling

### Backend
*   **Enhanced AI Prompts**: Includes 2024-2025 government scheme information (supplementing Groq's training data)
*   **Boundary Constraints**: Strict rules to keep AI within government services context
*   **Multilingual Support**: Hindi & English (Auto-switching based on key press)
*   **Smart Logging**: Automatically saves all conversations to SQLite database and CSV export
*   **Outbound Calls**: Trigger calls to multiple numbers with custom messages

### AI Enhancements
*   **Knowledge Base Update**: Adds 2024-2025 information for:
  - Digital India 2.0 initiatives
  - Updated PM-KISAN, Ayushman Bharat, PMAY schemes
  - G20 outcomes and policy updates
  - Latest e-governance services
*   **Boundary Enforcement**: AI strictly limited to:
  - Government services and schemes only
  - No personal opinions or political views
  - No financial/medical/legal advice
  - Professional and respectful responses only

## 📁 Project Structure

```
hack4delhi-main/
├── app.py                 # Flask backend with Twilio & Groq integration
├── frontend/              # React Vite application
│   ├── src/
│   │   ├── components/    # React components (Dashboard, Sidebar, ContactInfo)
│   │   └── App.jsx        # Main app component
│   └── vite.config.js     # Vite configuration with proxy
├── templates/             # Flask HTML templates (legacy)
├── requirements.txt       # Python dependencies
└── voice_agent.db         # SQLite database for call logs
```

## 🎯 Usage

1. **Access the Modern Dashboard**: Open `http://localhost:5173` in your browser
2. **Make Outbound Calls**: Use the dashboard to initiate calls with custom messages
3. **View Call Logs**: Monitor all inbound and outbound calls in real-time
4. **Download Logs**: Export call transcripts as CSV
5. **Contact Information**: Access government contact details from the sidebar

## 🔒 AI Safety Features

The system includes multiple layers of boundary enforcement:
- System prompts with strict rules
- Periodic boundary reminders during conversations
- Post-processing checks for inappropriate responses
- Clear guidelines to redirect users to official channels for sensitive queries

## 📝 Notes

- The React frontend is the recommended interface (modern UI)
- The Flask template dashboard at `http://localhost:5000` is still available for compatibility
- All API endpoints are CORS-enabled for frontend integration
