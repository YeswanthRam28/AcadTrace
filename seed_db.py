import psycopg2
import os
import sys
from dotenv import load_dotenv

# Path adjustment to import from backend
sys.path.append(os.path.join(os.getcwd(), 'acadtrace', 'backend'))
from db import get_db_connection

def run_sql_file(filename):
    print(f"--- Running {filename} ---")
    if not os.path.exists(filename):
        print(f"Error: {filename} not found.")
        return False
        
    try:
        conn = get_db_connection()
        # Use a standard cursor for executing multiple statements
        cur = conn.cursor()
        
        with open(filename, 'r', encoding='utf-8') as f:
            sql = f.read()
            
        # Execute the SQL
        # Note: cur.execute can often handle multiple statements if they are separated by semicolons
        # and if the driver/db allows it. Psycopg2's execute() usually handles it.
        cur.execute(sql)
        conn.commit()
        
        print(f"Successfully executed {filename}!")
        return True
        
    except Exception as e:
        print(f"Error executing {filename}: {e}")
        if 'conn' in locals():
            conn.rollback()
        return False
    finally:
        if 'conn' in locals():
            cur.close()
            conn.close()

if __name__ == "__main__":
    # If arguments are provided, use them, otherwise default to seed.sql
    files_to_run = sys.argv[1:] if len(sys.argv) > 1 else ['seed.sql']
    
    for sql_file in files_to_run:
        run_sql_file(sql_file)
