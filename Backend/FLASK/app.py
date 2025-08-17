from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_
import io
import pandas as pd

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Punith%401905@localhost:3306/employees_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Model
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(120), nullable=False)
    salary = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'role': self.role, 'salary': self.salary}

# Create the DB
with app.app_context():
    db.create_all()

# Listing API
@app.route('/api/employees', methods=['GET'])
def list_employees():
    page = int(request.args.get('page', 0))
    size = int(request.args.get('size', 10))
    sort_by = request.args.get('sortBy', 'id')
    sort_dir = request.args.get('sortDir', 'asc')
    role = request.args.get('role')
    keyword = request.args.get('keyword')

    query = Employee.query

    if role:
        query = query.filter(Employee.role.ilike(f'%{role}%'))
    if keyword:
        query = query.filter(Employee.name.ilike(f'%{keyword}%'))

    sort_col = getattr(Employee, sort_by, Employee.id)
    if sort_dir == 'desc':
        sort_col = sort_col.desc()
    else:
        sort_col = sort_col.asc()
    query = query.order_by(sort_col)

    total = query.count()
    employees = query.offset(page * size).limit(size).all()
    content = [e.to_dict() for e in employees]
    total_pages = (total + size - 1) // size

    return jsonify({
        "content": content,
        "totalElements": total,
        "totalPages": total_pages,
        "number": page,
        "size": size
    })

# Get employee by ID
@app.route('/api/employees/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    emp = Employee.query.get_or_404(emp_id)
    return jsonify(emp.to_dict())

# Create single employee
@app.route('/api/employees', methods=['POST'])
def add_employee():
    data = request.get_json()
    emp = Employee(name=data['name'], role=data['role'], salary=data['salary'])
    db.session.add(emp)
    db.session.commit()
    return jsonify(emp.to_dict()), 201

# Update single employee
@app.route('/api/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    data = request.get_json()
    emp = Employee.query.get_or_404(emp_id)
    emp.name = data['name']
    emp.role = data['role']
    emp.salary = data['salary']
    db.session.commit()
    return jsonify(emp.to_dict())

# Delete single employee
@app.route('/api/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    emp = Employee.query.get_or_404(emp_id)
    db.session.delete(emp)
    db.session.commit()
    return '', 204

# Bulk delete
@app.route('/api/employees/bulk-delete', methods=['DELETE'])
def bulk_delete():
    ids = request.get_json()
    Employee.query.filter(Employee.id.in_(ids)).delete(synchronize_session=False)
    db.session.commit()
    return '', 204

# Bulk import (CSV upload)
@app.route('/api/employees/import', methods=['POST'])
def import_csv():
    if 'file' not in request.files:
        return "Missing file", 400
    file = request.files['file']
    try:
        df = pd.read_csv(file)
        for _, row in df.iterrows():
            emp = Employee(name=row['name'], role=row['role'], salary=row['salary'])
            db.session.add(emp)
        db.session.commit()
        return jsonify({"message": "Import successful", "imported": len(df)})
    except Exception as e:
        return str(e), 400

# Export filtered list as CSV
@app.route('/api/employees/export', methods=['GET'])
def export_csv():
    page = int(request.args.get('page', 0))
    size = int(request.args.get('size', 10))
    sort_by = request.args.get('sortBy', 'id')
    sort_dir = request.args.get('sortDir', 'asc')
    role = request.args.get('role')
    keyword = request.args.get('keyword')

    query = Employee.query

    if role:
        query = query.filter(Employee.role.ilike(f'%{role}%'))
    if keyword:
        query = query.filter(Employee.name.ilike(f'%{keyword}%'))

    sort_col = getattr(Employee, sort_by, Employee.id)
    if sort_dir == 'desc':
        sort_col = sort_col.desc()
    else:
        sort_col = sort_col.asc()
    query = query.order_by(sort_col)

    employees = query.offset(page * size).limit(size).all()
    rows = [{'name': e.name, 'role': e.role, 'salary': e.salary} for e in employees]
    df = pd.DataFrame(rows)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return send_file(io.BytesIO(buf.read().encode()), mimetype='text/csv', as_attachment=True, download_name='employees.csv')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)
