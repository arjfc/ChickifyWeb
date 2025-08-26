import React from "react";

export default function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-primaryYellow">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-2 text-xl font-semibold text-center">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
