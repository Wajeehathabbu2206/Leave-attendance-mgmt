export default function Table({ headers, children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table className={`data-table ${className}`}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
