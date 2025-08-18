import React from "react";

const EmployeeTable = ({ employees, onEdit, onToggleSelect, selectedIds, onToggleSelectAll, onSort, currentSortBy, currentSortDir }) => {
  const allSelected = employees.length > 0 && employees.every(emp => selectedIds.includes(emp.id));

  // Show sort indicator arrows
  const renderSortArrow = (field) => {
    if (currentSortBy !== field) return null;
    return currentSortDir === "asc" ? " ▲" : " ▼";
  };

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleSelectAll(e.target.checked)}
            />
          </th>
          <th onClick={() => onSort("name")} style={{ cursor: "pointer" }}>
            Name{renderSortArrow("name")}
          </th>
          <th onClick={() => onSort("role")} style={{ cursor: "pointer" }}>
            Role{renderSortArrow("role")}
          </th>
          <th onClick={() => onSort("salary")} style={{ cursor: "pointer" }}>
            Salary{renderSortArrow("salary")}
          </th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
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
            <td>
              <button onClick={() => onEdit(emp)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
