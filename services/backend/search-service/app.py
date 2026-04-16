from flask import Flask, request, jsonify
from flask_cors import CORS
from db import query
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)


@app.route('/search', methods=['GET'])
def search():
    role     = request.args.get('role',     '').strip()
    company  = request.args.get('company',  '').strip()
    level    = request.args.get('level',    '').strip()
    location = request.args.get('location', '').strip()
    currency = request.args.get('currency', '').strip()

    try:
        min_salary = float(request.args.get('min_salary', 0) or 0)
        max_salary = float(request.args.get('max_salary', 0) or 0)
        limit      = min(int(request.args.get('limit', 50)  or 50), 200)
        offset     = int(request.args.get('offset', 0)      or 0)
    except ValueError:
        return jsonify({'error': 'Invalid numeric parameter'}), 400

    conditions = ["s.status = 'APPROVED'"]
    params     = []

    if role:
        conditions.append('LOWER(s.role) LIKE LOWER(%s)')
        params.append(f'%{role}%')
    if company:
        conditions.append('s.anonymize = FALSE AND LOWER(s.company) LIKE LOWER(%s)')
        params.append(f'%{company}%')
    if level:
        conditions.append('LOWER(s.level) = LOWER(%s)')
        params.append(level)
    if location:
        conditions.append('LOWER(s.location) LIKE LOWER(%s)')
        params.append(f'%{location}%')
    if currency:
        conditions.append('s.currency = %s')
        params.append(currency.upper())
    if min_salary > 0:
        conditions.append('s.salary_amount >= %s')
        params.append(min_salary)
    if max_salary > 0:
        conditions.append('s.salary_amount <= %s')
        params.append(max_salary)

    where = ' AND '.join(conditions)

    sql = f"""
        SELECT
            s.id,
            s.role,
            CASE WHEN s.anonymize THEN NULL ELSE s.company END AS company,
            s.level,
            s.location,
            s.salary_amount,
            s.currency,
            s.years_of_experience,
            s.tech_stack,
            s.anonymize,
            s.approved_at,
            COALESCE(v.upvotes,   0) AS upvotes,
            COALESCE(v.downvotes, 0) AS downvotes
        FROM salary.submissions s
        LEFT JOIN (
            SELECT submission_id,
                   SUM(CASE WHEN vote_type='up'   THEN 1 ELSE 0 END) AS upvotes,
                   SUM(CASE WHEN vote_type='down' THEN 1 ELSE 0 END) AS downvotes
            FROM community.votes
            GROUP BY submission_id
        ) v ON v.submission_id = s.id
        WHERE {where}
        ORDER BY s.approved_at DESC NULLS LAST
        LIMIT %s OFFSET %s
    """
    params += [limit, offset]

    rows = query(sql, params)
    for r in rows:
        r['id'] = str(r['id'])
        if r.get('approved_at'):
            r['approved_at'] = r['approved_at'].isoformat()

    return jsonify(rows), 200

@app.route('/pending', methods=['GET'])
def pending():
    sql = """
        SELECT
            s.id,
            s.role,
            CASE WHEN s.anonymize THEN NULL ELSE s.company END AS company,
            s.level,
            s.location,
            s.salary_amount,
            s.currency,
            s.years_of_experience,
            s.tech_stack,
            s.anonymize,
            s.submitted_at,
            COALESCE(v.upvotes,   0) AS upvotes,
            COALESCE(v.downvotes, 0) AS downvotes
        FROM salary.submissions s
        LEFT JOIN (
            SELECT submission_id,
                   SUM(CASE WHEN vote_type='up'   THEN 1 ELSE 0 END) AS upvotes,
                   SUM(CASE WHEN vote_type='down' THEN 1 ELSE 0 END) AS downvotes
            FROM community.votes
            GROUP BY submission_id
        ) v ON v.submission_id = s.id
        WHERE s.status = 'PENDING'
        ORDER BY s.submitted_at DESC
        LIMIT 100
    """
    rows = query(sql)
    for r in rows:
        r['id'] = str(r['id'])
        if r.get('submitted_at'):
            r['submitted_at'] = r['submitted_at'].isoformat()
    return jsonify(rows), 200


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'search'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=False)
