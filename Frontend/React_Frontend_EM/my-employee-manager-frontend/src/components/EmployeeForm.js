import React, { useState, useEffect } from "react";

const EmployeeForm = ({ onSubmit, onCancel, initialData }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setSalary(initialData.salary);
    } else {
      setName("");
      setRole("");
      setSalary("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !role || !salary || salary <= 0) {
      alert("Please fill all fields with valid data.");
      return;
    }
    onSubmit({ name, role, salary: parseFloat(salary) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name:
        <input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label>Role:
        <input value={role} onChange={e => setRole(e.target.value)} />
      </label>
      <label>Salary:
        <input type="number" value={salary} onChange={e => setSalary(e.target.value)} />
      </label>
      <button type="submit">Save</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default EmployeeForm;
