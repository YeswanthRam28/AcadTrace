import psycopg2
import os
from dotenv import load_dotenv

# Load db connection from the existing backend logic
import sys
sys.path.append(os.path.join(os.getcwd(), 'acadtrace', 'backend'))
from db import get_db_connection

def apply_migration():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        with open('features.sql', 'r') as f:
            sql = f.read()
            
        print("Applying features.sql...")
        cur.execute(sql)
        conn.commit()
        print("Successfully applied migration!")
        
    except Exception as e:
        print(f"Error applying migration: {e}")
    finally:
        if 'conn' in locals():
            cur.close()
            conn.close()

if __name__ == "__main__":
    apply_migration()
