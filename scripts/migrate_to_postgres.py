#!/usr/bin/env python3
"""
Migration script: SQLite to PostgreSQL
Safely migrates call logs, transcripts, and queries from SQLite to PostgreSQL
"""

import sqlite3
import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

# SQLite connection
SQLITE_DB = "voice_agent.db"

# PostgreSQL connection details
PG_HOST = os.environ.get("DB_HOST", "localhost")
PG_PORT = int(os.environ.get("DB_PORT", 5432))
PG_USER = os.environ.get("DB_USER", "hack4delhi_user")
PG_PASSWORD = os.environ.get("DB_PASSWORD", "")
PG_NAME = os.environ.get("DB_NAME", "hack4delhi_db")

def main():
    print("=" * 60)
    print("SQLite to PostgreSQL Migration")
    print("=" * 60)
    
    # Check if SQLite file exists
    if not os.path.exists(SQLITE_DB):
        print(f"Error: SQLite database '{SQLITE_DB}' not found!")
        return False
    
    try:
        # SQLite connection
        print("\n1. Connecting to SQLite...")
        sqlite_conn = sqlite3.connect(SQLITE_DB)
        sqlite_conn.row_factory = sqlite3.Row
        sqlite_cursor = sqlite_conn.cursor()
        print("   ✓ SQLite connection successful")
        
        # PostgreSQL connection
        print("\n2. Connecting to PostgreSQL...")
        pg_conn = psycopg2.connect(
            host=PG_HOST,
            port=PG_PORT,
            user=PG_USER,
            password=PG_PASSWORD,
            database=PG_NAME
        )
        pg_cursor = pg_conn.cursor()
        print("   ✓ PostgreSQL connection successful")
        
        # Migrate calls table
        print("\n3. Migrating 'calls' table...")
        try:
            sqlite_cursor.execute("SELECT * FROM calls")
            calls = sqlite_cursor.fetchall()
            
            if calls:
                for call in calls:
                    pg_cursor.execute("""
                        INSERT INTO calls (call_sid, from_number, to_number, direction, timestamp)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (call_sid) DO NOTHING
                    """, (call['call_sid'], call['from_number'], call['to_number'], 
                          call['direction'], call['timestamp']))
                
                pg_conn.commit()
                print(f"   ✓ Migrated {len(calls)} calls")
            else:
                print("   ✓ No calls to migrate")
        except sqlite3.OperationalError:
            print("   ⚠ 'calls' table not found in SQLite")
        except Exception as e:
            print(f"   ✗ Error migrating calls: {e}")
            pg_conn.rollback()
            raise
        
        # Migrate transcripts table
        print("\n4. Migrating 'transcripts' table...")
        try:
            sqlite_cursor.execute("SELECT * FROM transcripts")
            transcripts = sqlite_cursor.fetchall()
            
            if transcripts:
                for transcript in transcripts:
                    pg_cursor.execute("""
                        INSERT INTO transcripts (call_sid, role, message, timestamp)
                        VALUES (%s, %s, %s, %s)
                    """, (transcript['call_sid'], transcript['role'], 
                          transcript['message'], transcript['timestamp']))
                
                pg_conn.commit()
                print(f"   ✓ Migrated {len(transcripts)} transcripts")
            else:
                print("   ✓ No transcripts to migrate")
        except sqlite3.OperationalError:
            print("   ⚠ 'transcripts' table not found in SQLite")
        except Exception as e:
            print(f"   ✗ Error migrating transcripts: {e}")
            pg_conn.rollback()
            raise
        
        # Migrate queries table
        print("\n5. Migrating 'queries' table...")
        try:
            sqlite_cursor.execute("SELECT * FROM queries")
            queries = sqlite_cursor.fetchall()
            
            if queries:
                for query in queries:
                    # Handle different column names (SQLite uses 'user', PostgreSQL uses 'user_name')
                    user_val = query.get('user') or query.get('user_name', 'Unknown User')
                    pg_cursor.execute("""
                        INSERT INTO queries (timestamp, user_name, query, status)
                        VALUES (%s, %s, %s, %s)
                    """, (query['timestamp'], user_val, query['query'], query['status']))
                
                pg_conn.commit()
                print(f"   ✓ Migrated {len(queries)} queries")
            else:
                print("   ✓ No queries to migrate")
        except sqlite3.OperationalError:
            print("   ⚠ 'queries' table not found in SQLite")
        except Exception as e:
            print(f"   ✗ Error migrating queries: {e}")
            pg_conn.rollback()
            raise
        
        # Verify migration
        print("\n6. Verifying migration...")
        pg_cursor.execute("SELECT COUNT(*) FROM calls")
        calls_count = pg_cursor.fetchone()[0]
        
        pg_cursor.execute("SELECT COUNT(*) FROM transcripts")
        transcripts_count = pg_cursor.fetchone()[0]
        
        pg_cursor.execute("SELECT COUNT(*) FROM queries")
        queries_count = pg_cursor.fetchone()[0]
        
        print(f"   ✓ PostgreSQL now contains:")
        print(f"     - {calls_count} calls")
        print(f"     - {transcripts_count} transcripts")
        print(f"     - {queries_count} queries")
        
        # Cleanup
        sqlite_cursor.close()
        sqlite_conn.close()
        pg_cursor.close()
        pg_conn.close()
        
        print("\n" + "=" * 60)
        print("✓ Migration completed successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Update .env: Set DB_TYPE=postgres")
        print("2. Restart Flask: python app.py")
        print("3. Test API: curl http://localhost:8000/api/logs")
        print("4. Backup: Rename or backup voice_agent.db (optional)")
        print("\n")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
