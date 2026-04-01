import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    
    if db_url:
        return psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        
    # Fallback for local development
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "acadtrace"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "1234"),
        port=os.getenv("DB_PORT", "5432"),
        cursor_factory=RealDictCursor
    )
