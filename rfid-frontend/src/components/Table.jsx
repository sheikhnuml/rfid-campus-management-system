import React from "react";

export default function Table({ columns = [], data = [] }) {
  return (
    <table className="table card" style={{overflowX:"auto"}}>
      <thead>
        <tr>
          {columns.map((c) => <th key={c.key}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} className="small">No records.</td></tr>
        ) : (
          data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((c) => <td key={c.key}>{row[c.key]}</td>)}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
