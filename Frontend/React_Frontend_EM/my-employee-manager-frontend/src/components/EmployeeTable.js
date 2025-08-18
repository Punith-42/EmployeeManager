import React from "react";

const EmployeeTable = ({ employees, onEdit, onToggleSelect, selectedIds, onToggleSelectAll }) => {
  const allSelected = employees.length > 0 && employees.every(emp => selectedIds.includes(emp.id));
  
  return (
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} /></th>
          <th>Name</th>
          <th>Role</th>
          <th>Salary</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        {employees.map(emp => (
          <tr key={emp.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.includes(emp.id)}
                onChange={() => onToggleSelect(emp.id)}
              />
            </td>
            <td>{emp.name}</td>
            <td>{emp.role}</td>
            <td>{emp.salary}</td>
            <td><button onClick={() => onEdit(emp)}>Edit</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
