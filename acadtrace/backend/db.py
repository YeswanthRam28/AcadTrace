import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

# Global connection pool
_pool = None

def init_pool():
    global _pool
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found, using fallback local connection")
        return None
    
    _pool = psycopg2.pool.ThreadedConnectionPool(1, 10, db_url, cursor_factory=RealDictCursor)
    print("Database Connection Pool Initialized")
    return _pool

def get_db_connection():
    global _pool
    if _pool is None:
        init_pool()
    
    if _pool:
        return _pool.getconn()
    
    # Fallback for local development if no pool
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "acadtrace"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "1234"),
        port=os.getenv("DB_PORT", "5432"),
        cursor_factory=RealDictCursor
    )

def release_db_connection(conn):
    global _pool
    if _pool and conn:
        _pool.putconn(conn)

def close_pool():
    global _pool
    if _pool:
        _pool.closeall()
        print("Database Connection Pool Closed")
