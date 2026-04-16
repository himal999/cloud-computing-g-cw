import os, uuid
from datetime import datetime, timezone, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt, jwt
from db import query_one, execute
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

SECRET    = os.getenv('JWT_SECRET', 'change-me-in-production')
TOKEN_EXP = int(os.getenv('TOKEN_EXP_HOURS', 24))


def make_token(user_id: str) -> str:
    payload = {
        'sub': user_id,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXP),
    }
    return jwt.encode(payload, SECRET, algorithm='HS256')


def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    existing = query_one(
        'SELECT id FROM identity.users WHERE email = %s', (email,))
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())
    execute(
        'INSERT INTO identity.users (id, email, password_hash) VALUES (%s, %s, %s)',
        (user_id, email, pw_hash))

    token = make_token(user_id)
    return jsonify({'token': token, 'user_id': user_id}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = query_one(
        'SELECT id, password_hash, is_active FROM identity.users WHERE email = %s',
        (email,))

    if not user or not user['is_active']:
        return jsonify({'error': 'Invalid credentials'}), 401
    if not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = make_token(str(user['id']))
    return jsonify({'token': token, 'user_id': str(user['id'])}), 200

@app.route('/verify', methods=['POST'])
def verify():
    data  = request.get_json(silent=True) or {}
    token = data.get('token', '')
    payload = verify_token(token)
    if not payload:
        return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 401
    return jsonify({'valid': True, 'user_id': payload['sub']}), 200

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'identity'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
