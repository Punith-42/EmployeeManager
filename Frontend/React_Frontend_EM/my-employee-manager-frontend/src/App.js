import React, { useEffect, useState } from "react";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeForm from "./components/EmployeeForm";
import CSVUpload from "./components/CSVUpload";
import * as api from "./services/employeeService";

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const params = {
    page,
    size: 10,
    sortBy,
    sortDir,
    role: roleFilter,
    keyword,
  };

  const loadData = () => {
    api.fetchEmployees(params).then(data => {
      setEmployees(data.content);
      setTotalPages(data.totalPages);
      setSelectedIds([]);
    }).catch(() => alert("Failed to load employees"));
  };

  useEffect(() => {
    loadData();
  }, [page, sortBy, sortDir]);

  const handleAddClick = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setShowForm(true);
  };

  const handleFormSubmit = (formData) => {
    const promise = editingEmployee
      ? api.updateEmployee(editingEmployee.id, formData)
      : api.addEmployee(formData);

    promise.then(() => {
      alert(editingEmployee ? "Employee updated." : "Employee added.");
      setShowForm(false);
      loadData();
    }).catch(() => alert("Failed to save employee."));
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert("Select employees to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} employees?`)) return;

    api.bulkDeleteEmployees(selectedIds).then(() => {
      alert("Employees deleted");
      loadData();
    }).catch(() => alert("Failed to delete employees."));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  const toggleSelect = (id) => {
    setSelectedIds(sel =>
      sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]
    );
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(employees.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCSVUpload = (file) => {
    api.importCSV(file).then(() => {
      alert("CSV imported");
      loadData();
    }).catch(() => alert("Failed to import CSV"));
  };

  const handleExport = () => {
    const url = api.exportCSVUrl(params);
    window.open(url, "_blank");
  };

  return (
    <div className="App">
      <div>
        <button onClick={handleAddClick}>Add New Employee</button>
        <button onClick={handleDelete}>Bulk Delete</button>
        <button onClick={handleExport}>Export CSV</button>
      </div>

      <div>
        <input
          placeholder="Filter by role"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        />
        <input
          placeholder="Search by name"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <button onClick={() => { setPage(0); loadData(); }}>Search / Filter</button>
      </div>

      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onToggleSelect={toggleSelect}
        selectedIds={selectedIds}
        onToggleSelectAll={toggleSelectAll}
      />

      <div>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
        <span> Page {page + 1} of {totalPages} </span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {showForm && (
        <EmployeeForm
          initialData={editingEmployee}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <CSVUpload onUpload={handleCSVUpload} />
    </div>
  );
};

export default App;
