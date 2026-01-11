# PostgreSQL Quick Start Guide

Fast setup to switch from SQLite to PostgreSQL for your Hack4Delhi call logs.

## 1️⃣ Install PostgreSQL (Choose your OS)

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
- Download from: https://www.postgresql.org/download/windows/
- Run installer, note the password you set for user `postgres`

## 2️⃣ Create Database and User

Open PostgreSQL prompt:

```bash
# macOS/Linux
psql postgres

# Windows (in Command Prompt)
psql -U postgres
```

Copy and paste this SQL:

```sql
CREATE DATABASE hack4delhi_db;
CREATE USER hack4delhi_user WITH PASSWORD 'your_password_here';
ALTER ROLE hack4delhi_user SET client_encoding TO 'utf8';
ALTER ROLE hack4delhi_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE hack4delhi_user SET default_transaction_deferrable TO on;
ALTER ROLE hack4delhi_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE hack4delhi_db TO hack4delhi_user;
\q
```

**Replace `your_password_here` with a strong password!**

## 3️⃣ Update .env File

Add these lines to `/Users/kaniklchawla/Desktop/hack4delhi/.env`:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=hack4delhi_user
DB_PASSWORD=your_password_here
DB_NAME=hack4delhi_db
```

## 4️⃣ Install PostgreSQL Driver

```bash
cd /Users/kaniklchawla/Desktop/hack4delhi
source .venv/bin/activate
pip install psycopg2-binary==2.9.9
```

Or use the updated requirements:
```bash
pip install -r requirements.txt
```

## 5️⃣ Test Connection

```bash
python -c "
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
try:
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST'),
        port=int(os.environ.get('DB_PORT')),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD'),
        database=os.environ.get('DB_NAME')
    )
    print('✓ PostgreSQL connection successful!')
    conn.close()
except Exception as e:
    print(f'✗ Connection failed: {e}')
"
```

## 6️⃣ Migrate Existing Data (If any)

If you have existing SQLite data:

```bash
python migrate_to_postgres.py
```

This script will:
- Transfer all calls from SQLite
- Transfer all transcripts
- Transfer all queries
- Verify the migration

## 7️⃣ Start Your App

```bash
python app.py
```

You'll see in logs:
```
PostgreSQL database initialized successfully!
```

## 8️⃣ Test the API

```bash
curl http://localhost:8000/api/logs
```

Should return your call logs from PostgreSQL!

## 🆘 Troubleshooting

### "psycopg2: connection refused"
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start it
brew services start postgresql@15
```

### "password authentication failed"
```bash
# Reset password in PostgreSQL prompt
psql postgres
ALTER USER hack4delhi_user WITH PASSWORD 'new_password';
\q
```

### "database does not exist"
```bash
# Recreate it
psql postgres
CREATE DATABASE hack4delhi_db;
GRANT ALL PRIVILEGES ON DATABASE hack4delhi_db TO hack4delhi_user;
\q
```

### "psycopg2 module not found"
```bash
pip install psycopg2-binary
```

## 📊 Check Your Data

Connect to PostgreSQL and inspect data:

```bash
psql -U hack4delhi_user -d hack4delhi_db

# List tables
\dt

# Count calls
SELECT COUNT(*) FROM calls;

# Exit
\q
```

## 🚀 Benefits of PostgreSQL

✅ **Production-ready** - Used by major companies worldwide  
✅ **Scalable** - Handle millions of records  
✅ **Reliable** - ACID compliance, data integrity  
✅ **Advanced features** - JSON, arrays, full-text search  
✅ **Cloud-ready** - Deploy easily to Render, AWS RDS, etc.

## 📝 Next Steps

1. **Keep SQLite backup** (optional):
   ```bash
   cp voice_agent.db voice_agent.db.backup
   ```

2. **Monitor database** (optional):
   ```bash
   # Check database size
   psql -U hack4delhi_user -d hack4delhi_db -c "\l+"
   ```

3. **Deploy to production**:
   - Render.com: Create PostgreSQL database
   - Set DB_HOST, DB_USER, DB_PASSWORD from Render
   - Redeploy your backend

That's it! You're now using PostgreSQL! 🎉
