# AI Voice Assistant 🎙️

A fully functional AI Voice Agent that handles **Inbound** and **Outbound** calls using **Twilio** and **Groq (Llama 3)**. It supports multilingual conversations (Hindi/English) and includes an **Admin Dashboard** for managing calls and viewing logs.

## 🚀 Quick Setup (3 Steps)

### 1. Install & Configure
Clone the repo and install dependencies:
```bash
git clone https://github.com/aryaman-aga/hack4delhi.git
cd hack4delhi
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file with your keys:
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number
GROQ_API_KEY=your_groq_key
```

### 2. Run the Server
```bash
python3 app.py
```
> The dashboard will start at `http://localhost:5000`

### 3. Expose to Internet
You need `ngrok` to let Twilio talk to your local server.
```bash
ngrok http 5000
```
Copy the webhook URL (e.g., `https://abc.ngrok-free.app`) and:
1.  Go to Twilio Console > Phone Numbers.
2.  Paste URL + `/voice` in the **Webhook** field (Example: `https://abc.ngrok-free.app/voice`).

## 🌟 Features

*   **Admin Dashboard**: Manage calls and download Excel logs from `http://localhost:5000`.
*   **Outbound Calls**: Trigger calls to multiple numbers with custom messages directly from the UI.
*   **Multilingual**: Supports Hindi & English (Auto-switching based on key press).
*   **Smart Logging**: Automatically saves all conversations to a local database and CSV.
