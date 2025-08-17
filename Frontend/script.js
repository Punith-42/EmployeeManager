const API_BASE_URL = "http://localhost:8081/api/employees";
    let currentPage = 0;
    let totalPages = 1;
    let currentSortBy = "id";
    let currentSortDir = "asc";

    function loadEmployees() {
      const role = document.getElementById("filterRole").value.trim();
      const keyword = document.getElementById("searchKeyword").value.trim();

      let url = `${API_BASE_URL}?page=${currentPage}&size=10&sortBy=${currentSortBy}&sortDir=${currentSortDir}`;
      if (role) url += `&role=${encodeURIComponent(role)}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          renderTable(data.content);
          totalPages = data.totalPages;
          document.getElementById("currentPageDisplay").textContent = currentPage + 1;
          document.getElementById("totalPagesDisplay").textContent = totalPages;
          document.getElementById("prevBtn").disabled = currentPage === 0;
          document.getElementById("nextBtn").disabled = currentPage >= totalPages - 1;
        })
        .catch(err => alert("Failed to load employees."));
    }

    function renderTable(employees) {
      const tbody = document.getElementById("employeeTableBody");
      tbody.innerHTML = "";
      for (const emp of employees) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><input type="checkbox" data-id="${emp.id}" /></td>
          <td>${emp.name}</td>
          <td>${emp.role}</td>
          <td>${emp.salary}</td>
        `;
        tbody.appendChild(tr);
      }
    }

    function changePage(newPage) {
      if (newPage < 0 || newPage >= totalPages) return;
      currentPage = newPage;
      loadEmployees();
    }

    function sortByField(field) {
      if (field === currentSortBy) {
        currentSortDir = currentSortDir === "asc" ? "desc" : "asc";
      } else {
        currentSortBy = field;
        currentSortDir = "asc";
      }
      loadEmployees();
    }

    function toggleSelectAll(source) {
      const checkboxes = document.querySelectorAll("#employeeTableBody input[type=checkbox]");
      checkboxes.forEach(cb => cb.checked = source.checked);
    }

    function bulkDelete() {
      const selectedIds = Array.from(document.querySelectorAll("#employeeTableBody input[type=checkbox]:checked"))
        .map(cb => parseInt(cb.dataset.id));

      if (selectedIds.length === 0) {
        alert("Please select at least one employee to delete.");
        return;
      }

      if (!confirm(`Delete ${selectedIds.length} employees?`)) return;

      fetch(`${API_BASE_URL}/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedIds)
      })
      .then(res => {
        if (res.ok) {
          alert("Employees deleted");
          loadEmployees();
        } else {
          alert("Failed to delete employees");
        }
      })
      .catch(() => alert("Failed to delete employees."));
    }

    function exportCSV() {
      const role = document.getElementById("filterRole").value.trim();
      const keyword = document.getElementById("searchKeyword").value.trim();

      let url = `${API_BASE_URL}/export?page=${currentPage}&size=10&sortBy=${currentSortBy}&sortDir=${currentSortDir}`;
      if (role) url += `&role=${encodeURIComponent(role)}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

      window.open(url, "_blank");
    }

    function uploadCSV() {
      const fileInput = document.getElementById("csvFileInput");
      const file = fileInput.files[0];
      if (!file) {
        alert("Please select a CSV file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      fetch(`${API_BASE_URL}/import`, {
        method: "POST",
        body: formData
      })
        .then(res => {
          if (res.ok) {
            alert("CSV imported successfully.");
            fileInput.value = ""; // Clear input
            loadEmployees();
          } else {
            alert("Failed to import CSV.");
          }
        })
        .catch(() => alert("Failed to import CSV."));
    }

    function addEmployee() {
      const name = document.getElementById("newName").value.trim();
      const role = document.getElementById("newRole").value.trim();
      const salaryStr = document.getElementById("newSalary").value.trim();

      if (!name || !role || !salaryStr) {
        alert("Please fill in all fields.");
        return;
      }

      const salary = parseFloat(salaryStr);
      if (isNaN(salary) || salary <= 0) {
        alert("Please enter a valid positive salary.");
        return;
      }

      fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, salary })
      })
        .then(res => {
          if (res.ok) {
            alert("Employee added successfully.");
            document.getElementById("newName").value = "";
            document.getElementById("newRole").value = "";
            document.getElementById("newSalary").value = "";
            loadEmployees();
          } else {
            alert("Failed to add employee.");
          }
        })
        .catch(() => alert("Failed to add employee."));
    }

    // Initial load
    loadEmployees();