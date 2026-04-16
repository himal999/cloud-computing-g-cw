import os, uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import execute, query_one, query
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

APPROVAL_THRESHOLD = int(os.getenv('APPROVAL_THRESHOLD', 3))


def _get_counts(submission_id):
    rows = query(
        """SELECT vote_type, COUNT(*) AS cnt
             FROM community.votes
            WHERE submission_id = %s
            GROUP BY vote_type""",
        (submission_id,))
    counts = {'up': 0, 'down': 0}
    for r in rows:
        counts[r['vote_type']] = int(r['cnt'])
    return counts


def _maybe_approve(submission_id, counts):
    if counts['up'] - counts['down'] >= APPROVAL_THRESHOLD:
        execute(
            """UPDATE salary.submissions
                   SET status = 'APPROVED', approved_at = NOW()
                 WHERE id = %s AND status = 'PENDING'""",
            (submission_id,))


@app.route('/vote/<submission_id>', methods=['POST'])
def cast_vote(submission_id):
    data      = request.get_json(silent=True) or {}
    user_id   = request.headers.get('X-User-Id', '')
    vote_type = data.get('vote_type', '')

    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    if vote_type not in ('up', 'down'):
        return jsonify({'error': 'vote_type must be "up" or "down"'}), 400

    sub = query_one(
        'SELECT id, status FROM salary.submissions WHERE id = %s',
        (submission_id,))
    if not sub:
        return jsonify({'error': 'Submission not found'}), 404

    existing = query_one(
        'SELECT id FROM community.votes WHERE submission_id=%s AND user_id=%s',
        (submission_id, user_id))
    if existing:
        return jsonify({'error': 'You have already voted on this submission'}), 409

    execute(
        'INSERT INTO community.votes (id, submission_id, user_id, vote_type) VALUES (%s,%s,%s,%s)',
        (str(uuid.uuid4()), submission_id, user_id, vote_type))

    counts = _get_counts(submission_id)
    _maybe_approve(submission_id, counts)

    return jsonify({
        'submission_id': submission_id,
        'upvotes':   counts['up'],
        'downvotes': counts['down'],
        'status':    'APPROVED' if counts['up'] - counts['down'] >= APPROVAL_THRESHOLD else sub['status'],
    }), 200


@app.route('/votes/<submission_id>', methods=['GET'])
def get_votes(submission_id):
    counts = _get_counts(submission_id)
    return jsonify({'submission_id': submission_id, **counts}), 200


@app.route('/report/<submission_id>', methods=['POST'])
def report(submission_id):
    data    = request.get_json(silent=True) or {}
    user_id = request.headers.get('X-User-Id', '')
    reason  = data.get('reason', '').strip()

    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401

    valid_reasons = ['fake', 'duplicate', 'inappropriate', 'other']
    if reason not in valid_reasons:
        return jsonify({'error': f'reason must be one of: {", ".join(valid_reasons)}'}), 400

    sub = query_one(
        'SELECT id FROM salary.submissions WHERE id = %s', (submission_id,))
    if not sub:
        return jsonify({'error': 'Submission not found'}), 404

    existing = query_one(
        'SELECT id FROM community.reports WHERE submission_id=%s AND user_id=%s',
        (submission_id, user_id))
    if existing:
        return jsonify({'error': 'You have already reported this submission'}), 409

    execute(
        '''INSERT INTO community.reports
           (id, submission_id, user_id, reason, comment)
           VALUES (%s, %s, %s, %s, %s)''',
        (str(uuid.uuid4()), submission_id, user_id,
         reason, data.get('comment', ''))
    )
    return jsonify({
        'message': 'Submission reported successfully',
        'submission_id': submission_id,
        'reason': reason,
    }), 201


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'vote',
                    'approval_threshold': APPROVAL_THRESHOLD}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=False)
