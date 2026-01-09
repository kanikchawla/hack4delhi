import os
import csv
import sqlite3
import io
from datetime import datetime
from flask import Flask, request, session, render_template, jsonify, Response
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.rest import Client
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = 'supersecretkey'

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

# Language Configurations
LANG_CONFIG = {
    '1': { # Hindi
        'code': 'hi-IN',
        'system_prompt': """Aap ek sarkari AI voice assistant hain. 
Aapka lakshya sarkari yojanao aur sawalo mein user ki madad karna hai.
Apne jawab chhote (1-2 vaakya) aur spasht rakhein. Hinglish ya Hindi mein baat karein.""",
        'greeting': "Namaste. Main sarkari sawalon mein aapki sahayata ke liye yahan hoon.",
        'fallback_msg': "Maaf kijiye, koi samasya aayi hai. Kripya phir se prayas karein.",
        'listen_prompt': "Kya aap abhi bhi wahin hain?"
    },
    '2': { # English
        'code': 'en-IN',
        'system_prompt': """You are a helpful and polite AI voice assistant for government related queries.
Keep your answers concise (1-2 sentences) and suitable for a voice conversation. 
Do not use markdown, emojis, or bullet points. Speak naturally and clearly.""",
        'greeting': "Hi, I am here to assist you with government related queries.",
        'fallback_msg': "I'm sorry, I encountered an error. Please try again.",
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

@app.route("/download-logs")
def download_logs():
    """Export all transcripts to CSV."""
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
    
    return Response(output.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=call_logs_full.csv"})

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
        messages.append({"role": "user", "content": user_speech})
        
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile", 
            )
            ai_response = chat_completion.choices[0].message.content
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
    to_numbers_raw = request.form.get('to_number')
    webhook_url = request.form.get('webhook_url')
    custom_message = request.form.get('custom_message')
    
    if not to_numbers_raw or not webhook_url:
        return {"error": "Missing parameters"}, 400

    # Parse multiple numbers (split by comma)
    to_numbers = [num.strip() for num in to_numbers_raw.replace('\n', ',').split(',') if num.strip()]
    
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

    return {
        "message": f"Did connect {len(successful_calls)} calls. Failed: {len(failed_calls)}",
        "successful": successful_calls,
        "failed": failed_calls
    }

if __name__ == "__main__":
    app.run(debug=True, port=5000)
