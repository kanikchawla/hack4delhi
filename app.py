import os
import csv
import sqlite3
import io
from datetime import datetime
from flask import Flask, request, session, render_template, jsonify, Response
from flask_cors import CORS
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.rest import Client
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Enable CORS for React frontend
CORS(app, origins=[
    "http://localhost:5175",           # Local development
    "http://localhost:3000",           # Alternative local
    "https://hack4delhi.vercel.app",   # Vercel frontend
    "https://*.vercel.app"             # Any Vercel deployment
])

# Initialize Clients
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
twilio_client = Client(os.environ.get("TWILIO_ACCOUNT_SID"), os.environ.get("TWILIO_AUTH_TOKEN"))

# Database Setup
DB_NAME = "voice_agent.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Calls metadata
    c.execute('''CREATE TABLE IF NOT EXISTS calls 
                 (call_sid TEXT PRIMARY KEY, from_number TEXT, to_number TEXT, direction TEXT, timestamp TEXT)''')
    # Transcripts
    c.execute('''CREATE TABLE IF NOT EXISTS transcripts 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, call_sid TEXT, role TEXT, message TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()

init_db()

# --- Helpers ---
def log_call(call_sid, from_number, to_number, direction):
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT OR IGNORE INTO calls (call_sid, from_number, to_number, direction, timestamp) VALUES (?, ?, ?, ?, ?)",
                  (call_sid, from_number, to_number, direction, datetime.now().isoformat()))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Error (Call Log): {e}")

def log_transcript(call_sid, role, message):
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT INTO transcripts (call_sid, role, message, timestamp) VALUES (?, ?, ?, ?)",
                  (call_sid, role, message, datetime.now().isoformat()))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Error (Transcript): {e}")

# Enhanced Knowledge Base for 2024-2025 (Supplementing training data that ends in 2023)
RECENT_GOV_INFO = """
IMPORTANT RECENT UPDATES (2024-2025):
- Government of India has continued various digital initiatives including Digital India 2.0
- PM-KISAN scheme continues with enhanced coverage for farmers
- Ayushman Bharat health insurance has expanded coverage in 2024
- PMAY (Pradhan Mantri Awas Yojana) housing scheme continues with new phases
- Ujjwala scheme for LPG connections has extended benefits
- Skill India Mission continues with new training programs
- National Education Policy 2020 implementation is ongoing across states
- Various state-specific schemes continue with periodic updates
- G20 outcomes and initiatives from 2023 continue to influence policies
- Digital payment systems (UPI, RuPay) have seen massive adoption
- Government services through e-governance portals remain accessible 24/7
- Common Service Centres (CSCs) continue to provide citizen services
"""

# Language Configurations with Enhanced Prompts
LANG_CONFIG = {
    '1': { # Hindi
        'code': 'hi-IN',
        'system_prompt': f"""Aap Government of India ka ek official AI voice assistant hain.

BOUNDARY RULES (STRICTLY FOLLOW):
- SIRF sarkari yojanao, sevao, aur official information ke bare mein baat karein
- Personal opinion ya political views kabhi mat dijiye
- Financial advice, medical diagnosis, ya legal advice mat dijiye
- Agar kisi query ka jawab nahi pata, toh seedha kaho "Main is bare mein confirm karke batata hoon"
- Offensive, inappropriate, ya non-governmental topics par discussion mat karein
- Data privacy maintain karein - kisi bhi personal information ko record ya share mat karein

KNOWLEDGE BASE:
{RECENT_GOV_INFO}

WORKING GUIDELINES:
- Apne jawab chhote (1-2 vaakya) aur spasht rakhein
- Hinglish ya Hindi mein naturally baat karein
- Har answer mein helpful aur respectful tone maintain karein
- Official websites aur helpline numbers suggest kar sakte hain
- Agar specific department ki information chahiye, toh unke official channels ke bare mein bataein

CURRENT CONTEXT: Aap caller ko sarkari yojanao, forms, benefits, aur procedures ke bare mein madad kar rahe hain.""",
        'greeting': "Namaste. Main Government of India ka AI assistant hoon. Main aapki sarkari yojanao aur sevao ke bare mein madad kar sakta hoon.",
        'fallback_msg': "Maaf kijiye, koi samasya aayi hai. Kripya phir se prayas karein ya humare official helpline number par contact karein.",
        'listen_prompt': "Kya aap abhi bhi wahin hain?"
    },
    '2': { # English
        'code': 'en-IN',
        'system_prompt': f"""You are an official AI voice assistant for the Government of India.

BOUNDARY RULES (STRICTLY FOLLOW):
- ONLY discuss government schemes, services, and official information
- NEVER provide personal opinions or political views
- NEVER provide financial advice, medical diagnosis, or legal counsel
- If you don't know an answer, directly say "Let me confirm that information for you"
- NEVER engage in offensive, inappropriate, or non-governmental topics
- Maintain data privacy - NEVER record or share any personal information

KNOWLEDGE BASE:
{RECENT_GOV_INFO}

WORKING GUIDELINES:
- Keep answers concise (1-2 sentences) and suitable for voice conversation
- Do not use markdown, emojis, or bullet points - speak naturally
- Maintain a helpful, respectful, and professional tone
- You may suggest official websites and helpline numbers for detailed information
- For department-specific queries, guide users to official channels

CURRENT CONTEXT: You are helping callers with government schemes, forms, benefits, and procedures.""",
        'greeting': "Hello. I am an AI assistant for the Government of India. I can help you with government schemes and services.",
        'fallback_msg': "I'm sorry, I encountered an error. Please try again or contact our official helpline.",
        'listen_prompt': "Are you still there?"
    }
}

# --- Routes ---

@app.route("/")
def dashboard():
    """Render Admin Dashboard."""
    return render_template("dashboard.html")

@app.route("/api/logs")
def get_logs():
    """API for dashboard to fetch recent calls."""
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        # Get last 50 calls with their last message
        c.execute("""
            SELECT c.*, 
            (SELECT message FROM transcripts t WHERE t.call_sid = c.call_sid ORDER BY t.id DESC LIMIT 1) as last_message
            FROM calls c 
            ORDER BY c.timestamp DESC LIMIT 50
        """)
        rows = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(rows)
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/download-logs")
def download_logs():
    """Export all transcripts to CSV."""
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("""
            SELECT c.timestamp, c.direction, c.from_number, c.to_number, t.role, t.message 
            FROM transcripts t 
            JOIN calls c ON t.call_sid = c.call_sid 
            ORDER BY c.timestamp DESC, t.id ASC
        """)
        rows = c.fetchall()
        conn.close()

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Call Time', 'Direction', 'From', 'To', 'Speaker', 'Message'])
        writer.writerows(rows)
        
        csv_content = output.getvalue()
        return Response(
            csv_content, 
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment;filename=call_logs_{datetime.now().strftime('%Y-%m-%d')}.csv"}
        )
    except Exception as e:
        print(f"Error downloading logs: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/voice", methods=['GET', 'POST'])
def voice():
    """Entry point: Ask for language."""
    resp = VoiceResponse()
    
    # Log incoming call
    call_sid = request.values.get('CallSid', 'unknown')
    from_number = request.values.get('From', 'unknown')
    to_number = request.values.get('To', 'unknown')
    log_call(call_sid, from_number, to_number, 'Inbound')

    session.clear()
    
    # Check for custom message in query params (sent from outbound logic)
    custom_message = request.values.get('custom_message')
    
    gather_action = '/set-language'
    if custom_message:
         from urllib.parse import quote
         gather_action += f"?custom_message={quote(custom_message)}"

    gather = Gather(num_digits=1, action=gather_action, method='POST', timeout=10)
    gather.say("Hindi ke liye, ek dabayein. For English, press two.", language='hi-IN')
    resp.append(gather)
    resp.redirect('/voice')
    return str(resp)

@app.route("/set-language", methods=['POST'])
def set_language():
    digit = request.values.get('Digits')
    # Retrieve passed custom message
    custom_message = request.values.get('custom_message')
    
    if digit not in ['1', '2']:
        resp = VoiceResponse()
        resp.say("Invalid selection.")
        resp.redirect('/voice')
        return str(resp)
    
    config = LANG_CONFIG[digit]
    session['lang_id'] = digit
    
    # If custom message, override system prompt or greeting?
    # Let's say options: 1. Override Greeting. 2. Just say it.
    greeting_text = config['greeting']
    
    if custom_message:
        # Override Greeting.
        greeting_text = custom_message
        # Also maybe inject into system prompt logic context? 
        # "You initiated this call with: <msg>"
    
    session['messages'] = [{"role": "system", "content": config['system_prompt']}]
    
    resp = VoiceResponse()
    gather = Gather(num_digits=1, action='/handle-input', method='POST', input='speech', timeout=3, language=config['code'])
    gather.say(greeting_text, language=config['code'])
    resp.append(gather)
    resp.redirect('/listen')
    return str(resp)

@app.route("/listen", methods=['GET', 'POST'])
def listen():
    lang_id = session.get('lang_id', '2')
    config = LANG_CONFIG.get(lang_id, LANG_CONFIG['2'])
    resp = VoiceResponse()
    gather = Gather(action='/handle-input', method='POST', input='speech', timeout=3, language=config['code'])
    resp.append(gather)
    resp.say(config['listen_prompt'], language=config['code'])
    resp.redirect('/listen')
    return str(resp)

@app.route("/handle-input", methods=['GET', 'POST'])
def handle_input():
    lang_id = session.get('lang_id', '2')
    config = LANG_CONFIG.get(lang_id, LANG_CONFIG['2'])
    resp = VoiceResponse()
    
    user_speech = request.values.get('SpeechResult')
    call_sid = request.values.get('CallSid', 'unknown')
    
    if user_speech:
        log_transcript(call_sid, 'User', user_speech)

        messages = session.get('messages', [{"role": "system", "content": config['system_prompt']}])
        
        # Add reminder prompt to keep AI within boundaries (every 3 exchanges)
        conversation_length = len([m for m in messages if m['role'] == 'user'])
        if conversation_length > 0 and conversation_length % 3 == 0:
            boundary_reminder = {
                "role": "system", 
                "content": "REMINDER: Stay strictly within government services context. Do not provide personal opinions, financial/medical/legal advice, or discuss non-governmental topics."
            }
            messages.append(boundary_reminder)
        
        messages.append({"role": "user", "content": user_speech})
        
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0.7,  # Balanced creativity while maintaining accuracy
                max_tokens=150,  # Keep responses concise for voice
            )
            ai_response = chat_completion.choices[0].message.content
            
            # Post-process to ensure boundaries (basic check)
            if any(keyword in ai_response.lower() for keyword in ['i think', 'i believe', 'my opinion', 'personally']):
                ai_response = config['fallback_msg'] + " Please contact the official helpline for detailed guidance."
            
            log_transcript(call_sid, 'AI', ai_response)
            
            messages.append({"role": "assistant", "content": ai_response})
            session['messages'] = messages
            
            gather = Gather(num_digits=1, action='/handle-input', method='POST', input='speech', timeout=3, language=config['code'])
            gather.say(ai_response, language=config['code'])
            resp.append(gather)
            resp.redirect('/listen')
            
        except Exception as e:
            print(f"Error: {e}")
            resp.say(config['fallback_msg'], language=config['code'])
    else:
        resp.redirect('/listen')

    return str(resp)

@app.route("/make-call", methods=['POST'])
def make_call():
    try:
        to_numbers_raw = request.form.get('to_number', '').strip()
        webhook_url = request.form.get('webhook_url', '').strip()
        custom_message = request.form.get('custom_message', '').strip()
        
        if not to_numbers_raw or not webhook_url:
            return jsonify({"error": "Missing required parameters: to_number and webhook_url"}), 400

        # Parse multiple numbers (split by comma or newline)
        to_numbers = [num.strip() for num in to_numbers_raw.replace('\n', ',').split(',') if num.strip()]
        
        if not to_numbers:
            return jsonify({"error": "Please provide at least one valid phone number"}), 400

        # Append custom message to webhook URL if present
        final_webhook_url = webhook_url
        if custom_message:
            from urllib.parse import quote
            # Ensure we have ? or &
            separator = '&' if '?' in webhook_url else '?'
            final_webhook_url += f"{separator}custom_message={quote(custom_message)}"
        
        successful_calls = []
        failed_calls = []

        for to_number in to_numbers:
            try:
                from_number = os.environ.get("TWILIO_PHONE_NUMBER")
                if not from_number:
                    raise ValueError("TWILIO_PHONE_NUMBER not configured in environment")
                    
                call = twilio_client.calls.create(
                    to=to_number,
                    from_=from_number,
                    url=final_webhook_url
                )
                # Log Outbound Call Start
                log_call(call.sid, from_number, to_number, 'Outbound')
                successful_calls.append(to_number)
            except Exception as e:
                failed_calls.append({"number": to_number, "error": str(e)})
                print(f"Failed to call {to_number}: {e}")

        message = f"Initiated {len(successful_calls)} calls."
        if failed_calls:
            message += f" Failed: {len(failed_calls)}"
            
        return jsonify({
            "message": message,
            "successful": successful_calls,
            "failed": failed_calls,
            "total": len(to_numbers)
        })
    except Exception as e:
        print(f"Error in make_call: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
