import React from 'react'
import Table from '../../Table';

export default function SusActTable({type, risk}) {
  const logs = [
    {
      user: "John Reyes",
      flag: "Multiple Complaints",
      details: "5 complaints filed in 3 days",
      risk: "high",
      dateFlagged: `10/10/25`,
      status: "ongoing"
    },
    {
      user: "John Reyes",
      flag: "Multiple Complaints",
      details: "5 complaints filed in 3 days",
      risk: "high",
      dateFlagged: `10/10/25`,
      status: "ongoing"
    },
    {
      user: "John Reyes",
      flag: "Multiple Complaints",
      details: "5 complaints filed in 3 days",
      risk: "medium",
      dateFlagged: `10/10/25`,
      status: "ongoing"
    },
    {
      user: "John Reyes",
      flag: "Multiple Complaints",
      details: "5 complaints filed in 3 days",
      risk: "low",
      dateFlagged: `10/10/25`,
      status: "ongoing"
    },
  ];

   const filteredData = logs.filter((u) => {
    const flagMatch = type === "All" || !type ? true : u.flag.toLowerCase() === type.toLowerCase();
    const riskMatch = risk === "All" || !risk ? true : u.risk.toLowerCase() === risk.toLowerCase();
    return flagMatch && riskMatch;
  });

  const headers = ["User", "Type of Flag", "Details", "Risk", "Date Flagged", "Status"];
  return (
    <Table headers={headers}>
      {filteredData.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
        >
          <td className="px-4 py-3 text-center font-medium">
            {item.user}
          </td>
          <td className="px-4 py-3 text-center">{item.flag}</td>
          <td className="px-4 py-3 text-center">{item.details}</td>
          <td className="px-4 py-3 text-center capitalize">{item.risk}</td>
          <td className="px-4 py-3 text-center">{item.dateFlagged}</td>
          <td className="px-4 py-3 text-center capitalize">{item.status}</td>
        </tr>
      ))}
    </Table>
  );
}

