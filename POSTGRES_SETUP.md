# PostgreSQL Integration Guide for Call Logs

This guide walks you through migrating from SQLite to PostgreSQL for storing call logs and transcripts.

## Prerequisites

1. **PostgreSQL Installation**
   - macOS: `brew install postgresql@15`
   - Ubuntu/Debian: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Python Driver**
   - PostgreSQL requires `psycopg2` (already in updated requirements.txt)

## Step 1: Install PostgreSQL

### macOS
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Verify installation
psql --version
```

### Windows
- Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer and note the password you set for the `postgres` user
- PostgreSQL will start automatically as a service

## Step 2: Create Database and User

```bash
# Connect to PostgreSQL (on macOS/Linux)
psql postgres

# Or if you need to specify a user:
psql -U postgres
```

Once in the PostgreSQL prompt:

```sql
-- Create database
CREATE DATABASE hack4delhi_db;

-- Create user with password
CREATE USER hack4delhi_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
ALTER ROLE hack4delhi_user SET client_encoding TO 'utf8';
ALTER ROLE hack4delhi_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE hack4delhi_user SET default_transaction_deferrable TO on;
ALTER ROLE hack4delhi_user SET timezone TO 'UTC';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE hack4delhi_db TO hack4delhi_user;

-- Exit
\q
```

**Windows Users:**
- Use pgAdmin (GUI) that comes with PostgreSQL installer
- Or use command prompt: `psql -U postgres` and run the same SQL commands

## Step 3: Update Environment Variables

Create or update your `.env` file:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=hack4delhi_user
DB_PASSWORD=your_secure_password_here
DB_NAME=hack4delhi_db

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# Groq API
GROQ_API_KEY=your_groq_api_key

# Google Sheets (optional)
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CREDENTIALS_PATH=./google_credentials.json
```

## Step 4: Update requirements.txt

Add PostgreSQL driver:

```
psycopg2-binary==2.9.9
```

Or install directly:

```bash
pip install psycopg2-binary==2.9.9
```

## Step 5: Update app.py

Replace the SQLite imports and database initialization with PostgreSQL code:

### Before (SQLite):
```python
import sqlite3

DB_NAME = "voice_agent.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS calls 
                 (call_sid TEXT PRIMARY KEY, from_number TEXT, to_number TEXT, direction TEXT, timestamp TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS transcripts 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, call_sid TEXT, role TEXT, message TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()
```

### After (PostgreSQL):
```python
import psycopg2
from psycopg2 import sql
from urllib.parse import quote_plus

# Database Connection Details
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", 5432))
DB_USER = os.environ.get("DB_USER", "hack4delhi_user")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "hack4delhi_db")

def get_db_connection():
    """Create a new database connection."""
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
        print(f"Database connection error: {e}")
        raise

def init_db():
    """Initialize database tables."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Create calls table
        c.execute('''
            CREATE TABLE IF NOT EXISTS calls (
                call_sid TEXT PRIMARY KEY,
                from_number TEXT NOT NULL,
                to_number TEXT NOT NULL,
                direction TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT NOW()
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
        
        # Create indexes for better performance
        c.execute('''CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON calls(timestamp DESC)''')
        c.execute('''CREATE INDEX IF NOT EXISTS idx_transcripts_call_sid ON transcripts(call_sid)''')
        
        conn.commit()
        conn.close()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise
```

## Step 6: Update Database Helper Functions

### Update log_call():

**Before (SQLite):**
```python
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
```

**After (PostgreSQL):**
```python
def log_call(call_sid, from_number, to_number, direction):
    """Log a call to the database."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("""
            INSERT INTO calls (call_sid, from_number, to_number, direction, timestamp)
            VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT (call_sid) DO NOTHING
        """, (call_sid, from_number, to_number, direction))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Error (Call Log): {e}")
```

### Update log_transcript():

**Before (SQLite):**
```python
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
```

**After (PostgreSQL):**
```python
def log_transcript(call_sid, role, message):
    """Log a transcript message to the database."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("""
            INSERT INTO transcripts (call_sid, role, message, timestamp)
            VALUES (%s, %s, %s, NOW())
        """, (call_sid, role, message))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Error (Transcript): {e}")
```

## Step 7: Update API Endpoints

### Update /api/logs endpoint:

**Before (SQLite):**
```python
@app.route("/api/logs")
def get_logs():
    """API for dashboard to fetch recent calls."""
    try:
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
```

**After (PostgreSQL):**
```python
@app.route("/api/logs")
def get_logs():
    """API for dashboard to fetch recent calls."""
    try:
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
        return jsonify(rows)
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return jsonify({"error": str(e)}), 500
```

### Update /download-logs endpoint:

**Before (SQLite):**
```python
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
        # ... rest of CSV generation
```

**After (PostgreSQL):**
```python
@app.route("/download-logs")
def download_logs():
    """Export all transcripts to CSV."""
    try:
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
```

## Step 8: Migrate Existing SQLite Data (Optional)

If you have existing data in SQLite, export it to PostgreSQL:

### Using Python Script

Create `migrate_to_postgres.py`:

```python
import sqlite3
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# SQLite connection
sqlite_conn = sqlite3.connect('voice_agent.db')
sqlite_conn.row_factory = sqlite3.Row
sqlite_cursor = sqlite_conn.cursor()

# PostgreSQL connection
pg_conn = psycopg2.connect(
    host=os.environ.get("DB_HOST", "localhost"),
    port=int(os.environ.get("DB_PORT", 5432)),
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database=os.environ.get("DB_NAME")
)
pg_cursor = pg_conn.cursor()

try:
    # Migrate calls
    print("Migrating calls...")
    sqlite_cursor.execute("SELECT * FROM calls")
    calls = sqlite_cursor.fetchall()
    
    for call in calls:
        pg_cursor.execute("""
            INSERT INTO calls (call_sid, from_number, to_number, direction, timestamp)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (call_sid) DO NOTHING
        """, (call['call_sid'], call['from_number'], call['to_number'], call['direction'], call['timestamp']))
    
    pg_conn.commit()
    print(f"Migrated {len(calls)} calls")
    
    # Migrate transcripts
    print("Migrating transcripts...")
    sqlite_cursor.execute("SELECT * FROM transcripts")
    transcripts = sqlite_cursor.fetchall()
    
    for transcript in transcripts:
        pg_cursor.execute("""
            INSERT INTO transcripts (call_sid, role, message, timestamp)
            VALUES (%s, %s, %s, %s)
        """, (transcript['call_sid'], transcript['role'], transcript['message'], transcript['timestamp']))
    
    pg_conn.commit()
    print(f"Migrated {len(transcripts)} transcripts")
    
    print("Migration completed successfully!")
    
except Exception as e:
    print(f"Migration error: {e}")
    pg_conn.rollback()
finally:
    sqlite_cursor.close()
    sqlite_conn.close()
    pg_cursor.close()
    pg_conn.close()
```

Run migration:

```bash
python migrate_to_postgres.py
```

## Step 9: Test Connection

Update your `.env` with PostgreSQL credentials and test:

```bash
# Run your Flask app
source .venv/bin/activate
python app.py
```

Then in another terminal:

```bash
# Test the API
curl http://localhost:8000/api/logs
```

## Step 10: Deploy to Production (Render/Heroku)

### For Render.com (Recommended)

1. Create PostgreSQL database on Render:
   - Go to [render.com](https://render.com)
   - Click "New" → "PostgreSQL"
   - Set database name: `hack4delhi_db`
   - Copy connection string

2. Update environment variables in Render:
   - Get DB details from Render dashboard
   - Set in your backend environment variables:
     ```
     DB_HOST=your_render_db_host
     DB_PORT=5432
     DB_USER=your_render_db_user
     DB_PASSWORD=your_render_db_password
     DB_NAME=hack4delhi_db
     ```

3. Redeploy your backend service

### For Heroku

1. Add PostgreSQL addon:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. Heroku auto-sets `DATABASE_URL`. Update your connection code:
   ```python
   import os
   from urllib.parse import urlparse
   
   if 'DATABASE_URL' in os.environ:
       # Heroku deployment
       url = urlparse(os.environ['DATABASE_URL'])
       DB_HOST = url.hostname
       DB_PORT = url.port
       DB_USER = url.username
       DB_PASSWORD = url.password
       DB_NAME = url.path[1:]
   else:
       # Local development
       DB_HOST = os.environ.get("DB_HOST", "localhost")
       DB_PORT = int(os.environ.get("DB_PORT", 5432))
       DB_USER = os.environ.get("DB_USER")
       DB_PASSWORD = os.environ.get("DB_PASSWORD")
       DB_NAME = os.environ.get("DB_NAME")
   ```

## Troubleshooting

### Connection Refused
```
psycopg2.OperationalError: could not connect to server
```
- **Check**: Is PostgreSQL running? `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- **Solution**: Start PostgreSQL: `brew services start postgresql@15`

### Authentication Failed
```
psycopg2.OperationalError: FATAL: password authentication failed
```
- **Check**: Are credentials correct in `.env`?
- **Solution**: Reset password: `ALTER USER hack4delhi_user WITH PASSWORD 'new_password';`

### Database Does Not Exist
```
psycopg2.OperationalError: database "hack4delhi_db" does not exist
```
- **Solution**: Run database creation SQL from Step 2

### Import Error: psycopg2
```
ModuleNotFoundError: No module named 'psycopg2'
```
- **Solution**: `pip install psycopg2-binary`

## Performance Tips

1. **Add Indexes** (already in init_db):
   ```sql
   CREATE INDEX idx_calls_timestamp ON calls(timestamp DESC);
   CREATE INDEX idx_transcripts_call_sid ON transcripts(call_sid);
   ```

2. **Connection Pooling** (for production):
   ```bash
   pip install psycopg2-pool
   ```

3. **Monitor Database**:
   ```bash
   # Check active connections
   psql -U postgres -d hack4delhi_db -c "SELECT * FROM pg_stat_activity;"
   ```

4. **Backup**:
   ```bash
   pg_dump -U hack4delhi_user -d hack4delhi_db > backup.sql
   ```

## Summary

✅ You now have PostgreSQL set up with:
- `calls` table: Stores call metadata with timestamps
- `transcripts` table: Stores conversation messages linked to calls
- `queries` table: Stores user queries for Google Sheets integration
- Proper indexes for fast queries
- Environment variable configuration for security
- Migration script for existing data

The frontend CallLogs component works unchanged - it communicates through the same `/api/logs` endpoint!
