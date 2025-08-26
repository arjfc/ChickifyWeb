import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import Table from "./Table";
import { Link } from "react-router-dom";

export default function UserTable({ role, option, type }) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const users = [
    {
      firstName: "Maria",
      lastName: "Lopez",
      sex: "female",
      phoneNumber: "12345678911",
      address: "Sample Add Bantayan Island",
      farmName: "Alexandria Farm",
      farmLoc: "Alexandria Bantayan Island",
      username: "testname",
      email: "admin@gmail.com",
      role: "Farmer",
      status: "Active",
    },
    {
      firstName: "Juan",
      lastName: "Dela Cruz",
      sex: "male",
      phoneNumber: "9876543210",
      address: "Sample Add Bantayan Island",
      farmName: "Bantayan Farm",
      farmLoc: "Bantayan Island",
      username: "juan123",
      email: "buyer@gmail.com",
      role: "Buyer",
      status: "Inactive",
    },
    {
      firstName: "Anna",
      lastName: "Santos",
      sex: "female",
      phoneNumber: "1234509876",
      address: "Sample Add Bantayan Island",
      farmName: "Alexandria Farm",
      farmLoc: "Alexandria Bantayan Island",
      username: "anna99",
      email: "anna@gmail.com",
      role: "Farmer",
      status: "Inactive",
    },
    {
      firstName: "Anna",
      lastName: "Santos",
      sex: "female",
      phoneNumber: "1234509876",
      address: "Sample Add Bantayan Island",
      farmName: "Alexandria Farm",
      farmLoc: "Alexandria Bantayan Island",
      username: "anna99",
      email: "anna@gmail.com",
      role: "Admin",
      status: "Inactive",
    },
  ];

  // ✅ Filter users by role and status
  const filteredUsers = users.filter((u) => {
    const roleMatch = option === "All" || !option ? true : u.role.toLowerCase() === option.toLowerCase();
    const typeMatch = type === "All" || !type ? true : u.status.toLowerCase() === type.toLowerCase();
    return roleMatch && typeMatch;
  });

  const headers = [
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(filteredUsers.length).fill(isChecked));
      }}
    />,
    "Full Name",
    "Email",
    "Role",
    "Status",
    "Actions",
  ];

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);

    setSelectAll(updated.every(Boolean));
  };

  return (
    <Table headers={headers}>
      {filteredUsers.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100 text-gray-700 rounded-lg shadow-smtransition"
        >
          <td className="px-4 py-3 text-center">
            <input
              type="checkbox"
              checked={selected[index] || false}
              onChange={() => handleCheckboxChange(index)}
              className="accent-primaryYellow focus:ring-2 focus:ring-black"
            />
          </td>
          <td className="px-4 py-3 text-center font-medium">
            {item.firstName} {item.lastName}
          </td>
          <td className="px-4 py-3 text-center">{item.email}</td>
          <td className="px-4 py-3 text-center">{item.role}</td>
          <td
            className={`px-4 py-3 text-center font-medium ${
              item.status === "Active" ? "text-green-600" : "text-red-500"
            }`}
          >
            {item.status}
          </td>
          <td className="px-4 py-3 text-center flex flex-row gap-3 justify-center items-center">
            <Link
              to={`/${role}/users/view-users`}
              state={{ user: item }}
              className="flex items-center gap-2 bg-primaryYellow text-black px-4 py-2 rounded-lg hover:opacity-90 cursor-pointer"
            >
              <FaRegEye />
              <span>View</span>
            </Link>

            <Link
              to={`/${role}/users/edit-users`}
              state={{ user: item }}
              className="flex items-center gap-2 bg-yellow-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-yellow-200 cursor-pointer"
            >
              <FiEdit />
              <span>Edit</span>
            </Link>
          </td>
        </tr>
      ))}
    </Table>
  );
}
