import React from "react";
import Table from "../../Table";

export default function ReportsTable({type, role}) {
  const logs = [
    {
      timestamp: "April 28, 2025 10:45 AM",
      user: "John Reyes",
      role: "Admin",
      actionType: "Approved Listing",
      details: `Approved product "Organic Eggs (Large Tray)"`,
    },
    {
      timestamp: "April 28, 2025 10:45 AM",
      user: "John Reyes",
      role: "Admin",
      actionType: "Approved Listing",
      details: `Approved product "Organic Eggs (Large Tray)"`,
    },
    {
      timestamp: "April 28, 2025 10:45 AM",
      user: "John Reyes",
      role: "Admin",
      actionType: "Rejected Listing",
      details: `Approved product "Organic Eggs (Large Tray)"`,
    },
    {
      timestamp: "April 28, 2025 10:45 AM",
      user: "John Reyes",
      role: "Farmer",
      actionType: "Approved Listing",
      details: `Approved product "Organic Eggs (Large Tray)"`,
    },
    {
      timestamp: "April 28, 2025 10:45 AM",
      user: "John Reyes",
      role: "Admin",
      actionType: "Approved Listing",
      details: `Approved product "Organic Eggs (Large Tray)"`,
    },
    {
      timestamp: "April 28, 2025 10:45 AM",
      user: "John Reyes",
      role: "Alien",
      actionType: "Rejected Listing",
      details: `Approved product "Organic Eggs (Large Tray)"`,
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const roleMatch =
      !role || role === "All"
        ? true
        : log.role.toLowerCase() === role.toLowerCase();

    const typeMatch =
      !type || type === "All"
        ? true
        : log.actionType.toLowerCase() === type.toLowerCase();

    return roleMatch && typeMatch;
  });

  const headers = ["Timestamp", "User", "Role", "Action Type", "Details"];
  return (
    <Table headers={headers}>
      {filteredLogs.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100  text-gray-700 rounded-lg shadow-smtransition"
        >
          <td className="px-4 py-3 text-center font-medium">
            {item.timestamp}
          </td>
          <td className="px-4 py-3 text-center">{item.user}</td>
          <td className="px-4 py-3 text-center">{item.role}</td>
          <td className="px-4 py-3 text-center">{item.actionType}</td>
          <td className="px-4 py-3 text-center">{item.details}</td>
        </tr>
      ))}
    </Table>
  );
}
