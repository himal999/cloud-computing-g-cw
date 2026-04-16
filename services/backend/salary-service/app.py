import os, uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import execute, query_one
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

REQUIRED = ['role', 'level', 'location', 'salary_amount', 'years_of_experience']


@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json(silent=True) or {}
    missing = [f for f in REQUIRED if not data.get(f) and data.get(f) != 0]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    try:
        amount = float(data['salary_amount'])
        yoe    = int(data['years_of_experience'])
    except (ValueError, TypeError):
        return jsonify({'error': 'salary_amount and years_of_experience must be numbers'}), 400

    if amount <= 0:
        return jsonify({'error': 'salary_amount must be positive'}), 400
    if yoe < 0:
        return jsonify({'error': 'years_of_experience cannot be negative'}), 400

    sub_id = str(uuid.uuid4())
    execute(
        """INSERT INTO salary.submissions
            (id, role, company, level, location,
             salary_amount, currency, years_of_experience,
             tech_stack, anonymize, status)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'PENDING')""",
        (
            sub_id,
            str(data['role'])[:120],
            str(data.get('company', '') or '')[:120] or None,
            str(data['level'])[:60],
            str(data['location'])[:120],
            amount,
            str(data.get('currency', 'LKR'))[:10],
            yoe,
            str(data.get('tech_stack', '') or '')[:500] or None,
            bool(data.get('anonymize', True)),
        )
    )
    return jsonify({'id': sub_id, 'status': 'PENDING'}), 201


@app.route('/submission/<sub_id>', methods=['GET'])
def get_submission(sub_id):
    row = query_one(
        'SELECT * FROM salary.submissions WHERE id = %s', (sub_id,))
    if not row:
        return jsonify({'error': 'Not found'}), 404
    row['id'] = str(row['id'])
    return jsonify(row), 200


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'salary'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
