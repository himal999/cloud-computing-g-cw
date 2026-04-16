import os
import requests as req
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
IDENTITY_URL = os.getenv('IDENTITY_SERVICE_URL', 'http://identity-service:5001')
SALARY_URL   = os.getenv('SALARY_SERVICE_URL',   'http://salary-service:5002')
VOTE_URL     = os.getenv('VOTE_SERVICE_URL',      'http://vote-service:5003')
SEARCH_URL   = os.getenv('SEARCH_SERVICE_URL',    'http://search-service:5004')
STATS_URL    = os.getenv('STATS_SERVICE_URL',     'http://stats-service:5005')
TIMEOUT = 10

def _verify_token(auth_header: str):
    """Calls identity-service /verify. Returns user_id or None."""
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ', 1)[1]
    try:
        r = req.post(f'{IDENTITY_URL}/verify', json={'token': token}, timeout=TIMEOUT)
        data = r.json()
        return data.get('user_id') if data.get('valid') else None
    except Exception:
        return None


def _require_auth():
    user_id = _verify_token(request.headers.get('Authorization', ''))
    if not user_id:
        return None, jsonify({'error': 'Authentication required'}), 401
    return user_id, None, None


def _proxy_error(svc, e):
    return jsonify({'error': f'{svc} service unavailable', 'detail': str(e)}), 503

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        r = req.post(f'{IDENTITY_URL}/register',
                     json=request.get_json(silent=True), timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('identity', e)


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        r = req.post(f'{IDENTITY_URL}/login',
                     json=request.get_json(silent=True), timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('identity', e)

@app.route('/api/salary', methods=['POST'])
def submit_salary():
    try:
        r = req.post(f'{SALARY_URL}/submit',
                     json=request.get_json(silent=True), timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('salary', e)


@app.route('/api/salary/<sub_id>', methods=['GET'])
def get_salary(sub_id):
    try:
        r = req.get(f'{SALARY_URL}/submission/{sub_id}', timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('salary', e)

@app.route('/api/vote/<submission_id>', methods=['POST'])
def cast_vote(submission_id):
    user_id, err_resp, code = _require_auth()
    if err_resp:
        return err_resp, code
    try:
        r = req.post(
            f'{VOTE_URL}/vote/{submission_id}',
            json=request.get_json(silent=True),
            headers={'X-User-Id': user_id},
            timeout=TIMEOUT,
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('vote', e)


@app.route('/api/vote/<submission_id>/counts', methods=['GET'])
def vote_counts(submission_id):
    try:
        r = req.get(f'{VOTE_URL}/votes/{submission_id}', timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('vote', e)


@app.route('/api/report/<submission_id>', methods=['POST'])
def report_salary(submission_id):
    user_id, err_resp, code = _require_auth()
    if err_resp:
        return err_resp, code
    try:
        r = req.post(
            f'{VOTE_URL}/report/{submission_id}',
            json=request.get_json(silent=True),
            headers={'X-User-Id': user_id},
            timeout=TIMEOUT,
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('vote', e)

@app.route('/api/search', methods=['GET'])
def search():
    try:
        r = req.get(f'{SEARCH_URL}/search',
                    params=request.args.to_dict(), timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('search', e)

@app.route('/api/pending', methods=['GET'])
def pending_salaries():
    user_id, err_resp, code = _require_auth()
    if err_resp:
        return err_resp, code
    try:
        r = req.get(f'{SEARCH_URL}/pending', timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('search', e)


@app.route('/api/stats', methods=['GET'])
def stats():
    try:
        r = req.get(f'{STATS_URL}/stats',
                    params=request.args.to_dict(), timeout=TIMEOUT)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return _proxy_error('stats', e)

@app.route('/health')
def health():
    services = {
        'identity': IDENTITY_URL,
        'salary':   SALARY_URL,
        'vote':     VOTE_URL,
        'search':   SEARCH_URL,
        'stats':    STATS_URL,
    }
    statuses = {}
    for name, url in services.items():
        try:
            r = req.get(f'{url}/health', timeout=3)
            statuses[name] = 'ok' if r.status_code == 200 else 'degraded'
        except Exception:
            statuses[name] = 'unreachable'

    overall = 'ok' if all(v == 'ok' for v in statuses.values()) else 'degraded'
    return jsonify({'status': overall, 'service': 'bff', 'dependencies': statuses}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
