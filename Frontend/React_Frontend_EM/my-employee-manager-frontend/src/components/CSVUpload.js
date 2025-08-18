import React, { useState } from "react";

const CSVUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Select CSV file to upload.");
      return;
    }
    onUpload(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
      <button type="submit">Import CSV</button>
    </form>
  );
};

export default CSVUpload;
