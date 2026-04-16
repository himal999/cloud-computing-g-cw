import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager

DB_URL = os.getenv('DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/techsalary')

@contextmanager
def get_conn():
    conn = psycopg2.connect(DB_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def query(sql, params=None):
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            try:
                return [dict(r) for r in cur.fetchall()]
            except psycopg2.ProgrammingError:
                return []

def query_one(sql, params=None):
    rows = query(sql, params)
    return rows[0] if rows else None

def execute(sql, params=None):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
