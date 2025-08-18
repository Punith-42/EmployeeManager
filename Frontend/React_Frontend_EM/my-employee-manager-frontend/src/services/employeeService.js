import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/employees";

export const fetchEmployees = (params) =>
  axios.get(API_BASE_URL, { params }).then(res => res.data);

export const addEmployee = (data) =>
  axios.post(API_BASE_URL, data).then(res => res.data);

export const updateEmployee = (id, data) =>
  axios.put(`${API_BASE_URL}/${id}`, data).then(res => res.data);

export const deleteEmployee = (id) =>
  axios.delete(`${API_BASE_URL}/${id}`);

export const bulkDeleteEmployees = (ids) =>
  axios.delete(`${API_BASE_URL}/bulk-delete`, { data: ids });

export const importCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_BASE_URL}/import`, formData);
};

export const exportCSVUrl = (params) =>
  `${API_BASE_URL}/export?` + new URLSearchParams(params).toString();
