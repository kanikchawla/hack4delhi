import os
import csv
import sqlite3
import io
import json
from datetime import datetime
from flask import Flask, request, session, render_template, jsonify, Response
from flask_cors import CORS
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.rest import Client
from groq import Groq
from dotenv import load_dotenv

# PostgreSQL imports (with fallback to SQLite for compatibility)
try:
    import psycopg2
    from psycopg2 import sql
    USING_POSTGRES = True
except ImportError:
    USING_POSTGRES = False

# Load environment variables from .env file (explicit path for reliability)
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Enable CORS for React frontend
CORS(app, 
     origins=[
         "http://localhost:5175",
         "http://localhost:5174",
         "http://localhost:3000",
         "https://hack4delhi.vercel.app",
         "https://hack4delhi-1.onrender.com"
     ],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Initialize Clients
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
twilio_client = Client(os.environ.get("TWILIO_ACCOUNT_SID"), os.environ.get("TWILIO_AUTH_TOKEN"))

# Database Setup - PostgreSQL or SQLite
DB_TYPE = os.environ.get("DB_TYPE", "sqlite").lower()

if DB_TYPE == "postgres" and USING_POSTGRES:
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", 5432))
    DB_USER = os.environ.get("DB_USER", "hack4delhi_user")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_NAME = os.environ.get("DB_NAME", "hack4delhi_db")
    
    def get_db_connection():
        """Create a new PostgreSQL database connection."""
        try:
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME
            )
            conn.autocommit = False
            return conn
        except psycopg2.OperationalError as e:
            print(f"PostgreSQL connection error: {e}")
            raise
else:
    # Fallback to SQLite
    DB_NAME = "voice_agent.db"
    
    def get_db_connection():
        """Create a new SQLite database connection."""
        return sqlite3.connect(DB_NAME)

def init_db():
    """Initialize database tables."""
    try:
        if DB_TYPE == "postgres" and USING_POSTGRES:
            conn = get_db_connection()
            c = conn.cursor()
            
            # Create calls table
            c.execute('''
                CREATE TABLE IF NOT EXISTS calls (
                    call_sid TEXT PRIMARY KEY,
                    from_number TEXT NOT NULL,
                    to_number TEXT NOT NULL,
                    direction TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    summary TEXT,
                    recording_url TEXT
                )
            ''')
            
            # Create transcripts table
            c.execute('''
                CREATE TABLE IF NOT EXISTS transcripts (
                    id SERIAL PRIMARY KEY,
                    call_sid TEXT NOT NULL REFERENCES calls(call_sid) ON DELETE CASCADE,
                    role TEXT NOT NULL,
                    message TEXT,
                    timestamp TIMESTAMP DEFAULT NOW()
                )
            ''')
            
            # Create queries table
            c.execute('''
                CREATE TABLE IF NOT EXISTS queries (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    user_name TEXT,
                    query TEXT,
                    status TEXT DEFAULT 'pending'
                )
            ''')

            # Create suspicious_activity table
            c.execute('''
                CREATE TABLE IF NOT EXISTS suspicious_activity (
                    id SERIAL PRIMARY KEY,
                    call_sid TEXT,
                    phone_number TEXT,
                    reason TEXT,
                    timestamp TIMESTAMP DEFAULT NOW()
                )
            ''')
            
            # Create indexes for better performance
            c.execute('''CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON calls(timestamp DESC)''')
            c.execute('''CREATE INDEX IF NOT EXISTS idx_transcripts_call_sid ON transcripts(call_sid)''')
            
            conn.commit()
            conn.close()
            print("PostgreSQL database initialized successfully!")
        else:
            # SQLite initialization
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS calls 
                         (call_sid TEXT PRIMARY KEY, from_number TEXT, to_number TEXT, direction TEXT, timestamp TEXT, summary TEXT, recording_url TEXT)''')
            c.execute('''CREATE TABLE IF NOT EXISTS transcripts 
                         (id INTEGER PRIMARY KEY AUTOINCREMENT, call_sid TEXT, role TEXT, message TEXT, timestamp TEXT)''')
            c.execute('''CREATE TABLE IF NOT EXISTS queries 
                         (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, user TEXT, query TEXT, status TEXT)''')
            c.execute('''CREATE TABLE IF NOT EXISTS suspicious_activity 
                         (id INTEGER PRIMARY KEY AUTOINCREMENT, call_sid TEXT, phone_number TEXT, reason TEXT, timestamp TEXT)''')
            conn.commit()
            conn.close()
            print("SQLite database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

init_db()

# --- Helpers ---
def log_call(call_sid, from_number, to_number, direction):
    """Log a call to the database."""
    try:
        if DB_TYPE == "postgres" and USING_POSTGRES:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("""
                INSERT INTO calls (call_sid, from_number, to_number, direction, timestamp)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (call_sid) DO NOTHING
            """, (call_sid, from_number, to_number, direction))
            conn.commit()
            conn.close()
        else:
            # SQLite
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute("INSERT OR IGNORE INTO calls (call_sid, from_number, to_number, direction, timestamp) VALUES (?, ?, ?, ?, ?)",
                      (call_sid, from_number, to_number, direction, datetime.now().isoformat()))
            conn.commit()
            conn.close()
    except Exception as e:
        print(f"DB Error (Call Log): {e}")

def log_transcript(call_sid, role, message):
    """Log a transcript message to the database."""
    try:
        if DB_TYPE == "postgres" and USING_POSTGRES:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("""
                INSERT INTO transcripts (call_sid, role, message, timestamp)
                VALUES (%s, %s, %s, NOW())
            """, (call_sid, role, message))
            conn.commit()
            conn.close()
        else:
            # SQLite
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute("INSERT INTO transcripts (call_sid, role, message, timestamp) VALUES (?, ?, ?, ?)",
                      (call_sid, role, message, datetime.now().isoformat()))
            conn.commit()
            conn.close()
    except Exception as e:
        print(f"DB Error (Transcript): {e}")

def log_suspicious_activity(call_sid, phone_number, reason):
    """Log suspicious activity/fraud attempts."""
    try:
        if DB_TYPE == "postgres" and USING_POSTGRES:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("""
                INSERT INTO suspicious_activity (call_sid, phone_number, reason, timestamp)
                VALUES (%s, %s, %s, NOW())
            """, (call_sid, phone_number, reason))
            conn.commit()
            conn.close()
        else:
            # SQLite
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute("INSERT INTO suspicious_activity (call_sid, phone_number, reason, timestamp) VALUES (?, ?, ?, ?)",
                      (call_sid, phone_number, reason, datetime.now().isoformat()))
            conn.commit()
            conn.close()
    except Exception as e:
        print(f"DB Error (Suspicious Activity): {e}")

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

# Voice Configuration
VOICE_CONFIG = {
    'female_hindi': 'Polly.Aditi',
    'female_english': 'Polly.Raveena', 
    'male_hindi': 'Polly.Aditi',  # Polly doesn't have good male Hindi voice, using Aditi
    'male_english': 'Polly.Matthew'
}

# Language Configurations with Enhanced Prompts
LANG_CONFIG = {
    '1': { # Hindi
        'code': 'hi-IN',
        'voice_female': VOICE_CONFIG['female_hindi'],
        'voice_male': VOICE_CONFIG['male_hindi'],
        'system_prompt': f"""Aap Government of India ka ek official AI voice assistant hain.

BOUNDARY RULES (STRICTLY FOLLOW):
- SIRF sarkari yojanao, sevao, aur official information ke bare mein baat karein
- Personal opinion ya political views kabhi mat dijiye
- Financial advice, medical diagnosis, ya legal advice mat dijiye
- Agar kisi query ka jawab nahi pata, toh seedha kaho "Main is bare mein confirm karke batata hoon"
- Offensive, inappropriate, ya non-governmental topics par discussion mat karein
- Data privacy maintain karein - kisi bhi personal information ko record ya share mat karein
- FRAUD DETECTION Agar caller sensitive data maange (jaise voter list, private details, bulk data), toh turant mana karein aur response ki shuruwat mein [SUSPICIOUS] tag lagayein. Example: "[SUSPICIOUS] Maaf kijiye, main yeh personal/sensitive information share nahi kar sakti."

KNOWLEDGE BASE:
{RECENT_GOV_INFO}

WORKING GUIDELINES:
- Apne jawab chhote (1-2 vaakya) aur spasht rakhein
- Hinglish ya Hindi mein naturally baat karein
- Har answer mein helpful aur respectful tone maintain karein
- Official websites aur helpline numbers suggest kar sakte hain
- Agar specific department ki information chahiye, toh unke official channels ke bare mein bataein

CURRENT CONTEXT: Aap caller ko sarkari yojanao, forms, benefits, aur procedures ke bare mein madad kar rahe hain.""",
        'greeting': "Namaste. Main Government of India ki AI assistant hoon. Main aapki sarkari yojanao aur sevao ke bare mein madad kar sakti hoon.",
        'fallback_msg': "Maaf kijiye, koi samasya aayi hai. Kripya phir se prayas karein ya humare official helpline number par contact karein.",
        'listen_prompt': "Kya aap abhi bhi wahin hain?"
    },
    '2': { # English
        'code': 'en-IN',
        'voice_female': VOICE_CONFIG['female_english'],
        'voice_male': VOICE_CONFIG['male_english'],
        'system_prompt': f"""You are an official AI voice assistant for the Government of India.

BOUNDARY RULES (STRICTLY FOLLOW):
- ALWAYS speak in English. Do not switch to Hindi unless explicitly asked.
- ONLY discuss government schemes, services, and official information
- NEVER provide personal opinions or political views
- NEVER provide financial advice, medical diagnosis, or legal counsel
- If you don't know an answer, directly say "Let me confirm that information for you"
- NEVER engage in offensive, inappropriate, or non-governmental topics
- Maintain data privacy - NEVER record or share any personal information
- FRAUD DETECTION: If the caller asks for sensitive data (e.g., voter lists, private details of others, bulk data), REFUSE politely and START your response with [SUSPICIOUS] tag. Example: "[SUSPICIOUS] I apologize, I cannot share such sensitive or personal information."

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
        if DB_TYPE == "postgres" and USING_POSTGRES:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("""
                SELECT 
                    c.call_sid,
                    c.from_number,
                    c.to_number,
                    c.direction,
                    c.timestamp,
                    (SELECT message FROM transcripts t WHERE t.call_sid = c.call_sid ORDER BY t.id DESC LIMIT 1) as last_message
                FROM calls c 
                ORDER BY c.timestamp DESC LIMIT 50
            """)
            
            columns = [desc[0] for desc in c.description]
            rows = [dict(zip(columns, row)) for row in c.fetchall()]
            conn.close()
        else:
            # SQLite
            conn = sqlite3.connect(DB_NAME)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
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
        if DB_TYPE == "postgres" and USING_POSTGRES:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("""
                SELECT 
                    c.timestamp::text,
                    c.direction,
                    c.from_number,
                    c.to_number,
                    t.role,
                    t.message 
                FROM transcripts t 
                JOIN calls c ON t.call_sid = c.call_sid 
                ORDER BY c.timestamp DESC, t.id ASC
            """)
            rows = c.fetchall()
            conn.close()
        else:
            # SQLite
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
    
    # Add recording disclaimer
    resp.say("Your call will be recorded for training purposes.")
    
    gather_action = '/set-language'
    if custom_message:
         from urllib.parse import quote
         gather_action += f"?custom_message={quote(custom_message)}"

    gather = Gather(num_digits=1, action=gather_action, method='POST', timeout=10)
    gather.say("Hindi ke liye, ek dabayein. For English, press two.", language='hi-IN',voice='Polly.Aditi' )
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
        resp.say("Invalid selection.", voice='Polly.Aditi')
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
    session['voice'] = config['voice_female']  # Default to female voice, can be changed based on detection
    
    resp = VoiceResponse()
    gather = Gather(num_digits=1, action='/handle-input', method='POST', input='speech', timeout=3, language=config['code'])
    gather.say(greeting_text, language=config['code'], voice=config['voice_female'])
    resp.append(gather)
    resp.redirect('/listen')
    return str(resp)

@app.route("/listen", methods=['GET', 'POST'])
def listen():
    lang_id = session.get('lang_id', '2')
    config = LANG_CONFIG.get(lang_id, LANG_CONFIG['2'])
    resp = VoiceResponse()
    voice = session.get('voice', config.get('voice_female', 'Polly.Aditi'))
    gather = Gather(action='/handle-input', method='POST', input='speech', timeout=3, language=config['code'])
    resp.append(gather)
    resp.say(config['listen_prompt'], language=config['code'], voice=voice)
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
                model="llama-3.3-70b-versatile",  # Best available model on Groq
                temperature=0.6,  # Slightly lower for more consistent government info
                max_tokens=150,  # Keep responses concise for voice
                top_p=0.9,  # Better quality responses
            )
            ai_response = chat_completion.choices[0].message.content
            
            # Check for suspicious activity flag from AI
            if '[SUSPICIOUS]' in ai_response:
                from_number = request.values.get('From', 'unknown')
                log_suspicious_activity(call_sid, from_number, f"Suspicious Query: {user_speech}")
                # Remove the tag for speech output
                ai_response = ai_response.replace('[SUSPICIOUS]', '').strip()

            # Post-process to ensure boundaries (basic check)
            if any(keyword in ai_response.lower() for keyword in ['i think', 'i believe', 'my opinion', 'personally']):
                ai_response = config['fallback_msg'] + " Please contact the official helpline for detailed guidance."
            
            log_transcript(call_sid, 'AI', ai_response)
            
            messages.append({"role": "assistant", "content": ai_response})
            session['messages'] = messages
            
            voice = session.get('voice', config.get('voice_female', 'Polly.Aditi'))
            gather = Gather(num_digits=1, action='/handle-input', method='POST', input='speech', timeout=3, language=config['code'])
            gather.say(ai_response, language=config['code'], voice=voice)
            resp.append(gather)
            resp.redirect('/listen')
            
        except Exception as e:
            print(f"Error: {e}")
            voice = session.get('voice', config.get('voice_female', 'Polly.Aditi'))
            resp.say(config['fallback_msg'], language=config['code'], voice=voice)
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

@app.route("/api/submit-query", methods=['POST'])
def submit_query():
    """Submit a query/grievance (to be synced with Google Sheets if configured)."""
    try:
        data = request.get_json()
        query_text = data.get('query', '').strip()
        user = data.get('user', 'Unknown User')
        
        if not query_text:
            return jsonify({"error": "Query text is required"}), 400
        
        # Log to database (PostgreSQL or SQLite)
        try:
            if DB_TYPE == "postgres" and USING_POSTGRES:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("""
                    INSERT INTO queries (timestamp, user_name, query, status)
                    VALUES (NOW(), %s, %s, %s)
                """, (user, query_text, 'Submitted'))
                conn.commit()
                conn.close()
                db_status = "Stored in PostgreSQL"
            else:
                # SQLite
                conn = sqlite3.connect(DB_NAME)
                c = conn.cursor()
                c.execute('''CREATE TABLE IF NOT EXISTS queries 
                             (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, user TEXT, query TEXT, status TEXT)''')
                c.execute("INSERT INTO queries (timestamp, user, query, status) VALUES (?, ?, ?, ?)",
                          (datetime.now().isoformat(), user, query_text, 'Submitted'))
                conn.commit()
                conn.close()
                db_status = "Stored in SQLite"
        except Exception as db_err:
            print(f"Database error: {db_err}")
            db_status = f"Database error: {str(db_err)}"
        
        # Attempt to sync with Google Sheets (if configured)
        google_sync_status = "Not Configured"
        try:
            from google.oauth2.service_account import Credentials
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            
            credentials_path = os.environ.get('GOOGLE_SHEETS_CREDENTIALS_JSON')
            sheet_id = os.environ.get('GOOGLE_SHEETS_SHEET_ID')
            
            if credentials_path and sheet_id and os.path.exists(credentials_path):
                try:
                    # Load credentials from JSON file
                    credentials = Credentials.from_service_account_file(
                        credentials_path,
                        scopes=['https://www.googleapis.com/auth/spreadsheets']
                    )
                    
                    # Build the Sheets API client
                    service = build('sheets', 'v4', credentials=credentials)
                    
                    # Prepare the data to append
                    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    values = [[timestamp, user, query_text, 'Submitted']]
                    
                    # Append to the sheet (assumes headers in first row)
                    body = {'values': values}
                    result = service.spreadsheets().values().append(
                        spreadsheetId=sheet_id,
                        range='Sheet1!A:D',
                        valueInputOption='USER_ENTERED',
                        body=body
                    ).execute()
                    
                    google_sync_status = "Synced to Google Sheets"
                    print(f"Successfully appended to sheet: {result}")
                    
                except Exception as sheets_err:
                    google_sync_status = f"Google Sheets error: {str(sheets_err)}"
                    print(f"Google Sheets sync error: {sheets_err}")
            else:
                google_sync_status = "Google Sheets not configured"
        except ImportError:
            google_sync_status = "Google API libraries not installed"
        except Exception as google_err:
            google_sync_status = f"Error: {str(google_err)}"
            print(f"Google integration error: {google_err}")
        
        return jsonify({
            "message": "Query submitted successfully",
            "database": db_status,
            "google_sheets": google_sync_status
        }), 200
        
    except Exception as e:
        print(f"Error in submit_query: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
