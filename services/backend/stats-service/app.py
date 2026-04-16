from flask import Flask, request, jsonify
from flask_cors import CORS
from db import query, query_one
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)


def _build_where(role, location, currency):
    conditions = ["status = 'APPROVED'"]
    params     = []
    if role:
        conditions.append('LOWER(role) LIKE LOWER(%s)')
        params.append(f'%{role}%')
    if location:
        conditions.append('LOWER(location) LIKE LOWER(%s)')
        params.append(f'%{location}%')
    if currency:
        conditions.append('currency = %s')
        params.append(currency.upper())
    return ' AND '.join(conditions), params


@app.route('/stats', methods=['GET'])
def stats():
    role     = request.args.get('role',     '').strip()
    location = request.args.get('location', '').strip()
    currency = request.args.get('currency', 'LKR').strip() or 'LKR'

    where, params = _build_where(role, location, currency)

    agg = query_one(f"""
        SELECT
            COUNT(*)                                    AS count,
            ROUND(AVG(salary_amount)::numeric,    2)   AS average,
            ROUND(PERCENTILE_CONT(0.5)
                  WITHIN GROUP (ORDER BY salary_amount)::numeric, 2) AS median,
            ROUND(MIN(salary_amount)::numeric,    2)   AS min,
            ROUND(MAX(salary_amount)::numeric,    2)   AS max,
            ROUND(PERCENTILE_CONT(0.25)
                  WITHIN GROUP (ORDER BY salary_amount)::numeric, 2) AS p25,
            ROUND(PERCENTILE_CONT(0.75)
                  WITHIN GROUP (ORDER BY salary_amount)::numeric, 2) AS p75
        FROM salary.submissions
        WHERE {where}
    """, params)

    by_role = query(f"""
        SELECT
            role,
            COUNT(*)                                  AS count,
            ROUND(AVG(salary_amount)::numeric, 2)    AS average,
            ROUND(MIN(salary_amount)::numeric, 2)    AS min,
            ROUND(MAX(salary_amount)::numeric, 2)    AS max
        FROM salary.submissions
        WHERE {where}
        GROUP BY role
        ORDER BY average DESC NULLS LAST
        LIMIT 20
    """, params)

    by_level = query(f"""
        SELECT
            level,
            COUNT(*)                                  AS count,
            ROUND(AVG(salary_amount)::numeric, 2)    AS average
        FROM salary.submissions
        WHERE {where} AND level IS NOT NULL
        GROUP BY level
        ORDER BY average DESC NULLS LAST
    """, params)

    result = {
        'currency': currency,
        'count':    int(agg['count'] or 0),
        'average':  float(agg['average']  or 0),
        'median':   float(agg['median']   or 0),
        'min':      float(agg['min']      or 0),
        'max':      float(agg['max']      or 0),
        'p25':      float(agg['p25']      or 0),
        'p75':      float(agg['p75']      or 0),
        'by_role':  [
            {**r, 'average': float(r['average'] or 0),
                  'min':     float(r['min'] or 0),
                  'max':     float(r['max'] or 0),
                  'count':   int(r['count'])} for r in by_role
        ],
        'by_level': [
            {**r, 'average': float(r['average'] or 0),
                  'count':   int(r['count'])} for r in by_level
        ],
    }
    return jsonify(result), 200


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'stats'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=False)
