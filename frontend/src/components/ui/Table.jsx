import React from 'react';

/**
 * Universal Responsive Table Wrapper Component
 */
export const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto border border-[#2C384E] rounded-xl bg-[#0B0F17] ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`border-b border-[#2C384E] bg-[#131B2A]/80 text-slate-400 font-bold uppercase tracking-wider ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-[#2C384E]/60 text-slate-200 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-[#131B2A]/60 transition ${className}`}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`p-3 font-semibold ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`p-3 ${className}`}>{children}</td>
);

export default Table;
