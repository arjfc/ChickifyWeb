// import React, { useState } from "react";
// import { FaRegEye } from "react-icons/fa";
// import { FiEdit } from "react-icons/fi";
// import Table from "./Table";
// import { Link } from "react-router-dom";

// export default function UserTable({ role, option, type }) {
//   const [selected, setSelected] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);

//   const users = [
//     {
//       firstName: "Maria",
//       lastName: "Lopez",
//       sex: "female",
//       phoneNumber: "12345678911",
//       address: "Sample Add Bantayan Island",
//       farmName: "Alexandria Farm",
//       farmLoc: "Alexandria Bantayan Island",
//       username: "testname",
//       email: "admin@gmail.com",
//       role: "Farmer",
//       status: "Active",
//     },
//     {
//       firstName: "Juan",
//       lastName: "Dela Cruz",
//       sex: "male",
//       phoneNumber: "9876543210",
//       address: "Sample Add Bantayan Island",
//       farmName: "Bantayan Farm",
//       farmLoc: "Bantayan Island",
//       username: "juan123",
//       email: "buyer@gmail.com",
//       role: "Buyer",
//       status: "Inactive",
//     },
//     {
//       firstName: "Anna",
//       lastName: "Santos",
//       sex: "female",
//       phoneNumber: "1234509876",
//       address: "Sample Add Bantayan Island",
//       farmName: "Alexandria Farm",
//       farmLoc: "Alexandria Bantayan Island",
//       username: "anna99",
//       email: "anna@gmail.com",
//       role: "Farmer",
//       status: "Inactive",
//     },
//     {
//       firstName: "Anna",
//       lastName: "Santos",
//       sex: "female",
//       phoneNumber: "1234509876",
//       address: "Sample Add Bantayan Island",
//       farmName: "Alexandria Farm",
//       farmLoc: "Alexandria Bantayan Island",
//       username: "anna99",
//       email: "anna@gmail.com",
//       role: "Admin",
//       status: "Inactive",
//     },
//   ];

//   // ✅ Filter users by role and status
//   const filteredUsers = users.filter((u) => {
//     const roleMatch = option === "All" || !option ? true : u.role.toLowerCase() === option.toLowerCase();
//     const typeMatch = type === "All" || !type ? true : u.status.toLowerCase() === type.toLowerCase();
//     return roleMatch && typeMatch;
//   });

//   const headers = [
//     <input
//       key="selectAll"
//       type="checkbox"
//       checked={selectAll}
//       className="accent-primaryYellow focus:ring-2 focus:ring-black"
//       onChange={(e) => {
//         const isChecked = e.target.checked;
//         setSelectAll(isChecked);
//         setSelected(Array(filteredUsers.length).fill(isChecked));
//       }}
//     />,
//     "Full Name",
//     "Email",
//     "Role",
//     "Status",
//     "Actions",
//   ];

//   const handleCheckboxChange = (index) => {
//     const updated = [...selected];
//     updated[index] = !updated[index];
//     setSelected(updated);

//     setSelectAll(updated.every(Boolean));
//   };

//   return (
//     <Table headers={headers}>
//       {filteredUsers.map((item, index) => (
//         <tr
//           key={index}
//           className="bg-yellow-100 text-gray-700 rounded-lg shadow-smtransition"
//         >
//           <td className="px-4 py-3 text-center">
//             <input
//               type="checkbox"
//               checked={selected[index] || false}
//               onChange={() => handleCheckboxChange(index)}
//               className="accent-primaryYellow focus:ring-2 focus:ring-black"
//             />
//           </td>
//           <td className="px-4 py-3 text-center font-medium">
//             {item.firstName} {item.lastName}
//           </td>
//           <td className="px-4 py-3 text-center">{item.email}</td>
//           <td className="px-4 py-3 text-center">{item.role}</td>
//           <td
//             className={`px-4 py-3 text-center font-medium ${
//               item.status === "Active" ? "text-green-600" : "text-red-500"
//             }`}
//           >
//             {item.status}
//           </td>
//           <td className="px-4 py-3 text-center flex flex-row gap-3 justify-center items-center">
//             <Link
//               to={`/${role}/users/view-users`}
//               state={{ user: item }}
//               className="flex items-center gap-2 bg-primaryYellow text-black px-4 py-2 rounded-lg hover:opacity-90 cursor-pointer"
//             >
//               <FaRegEye />
//               <span>View</span>
//             </Link>

//             <Link
//               to={`/${role}/users/edit-users`}
//               state={{ user: item }}
//               className="flex items-center gap-2 bg-yellow-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-yellow-200 cursor-pointer"
//             >
//               <FiEdit />
//               <span>Edit</span>
//             </Link>
//           </td>
//         </tr>
//       ))}
//     </Table>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import Table from "./Table";
import { Link } from "react-router-dom";

export default function UserTable({
  role,
  option = "All",            // role filter: All | Admin | Farmer | Buyer
  type = "All",               // status filter: All | Active | Inactive | Deactivated
  rows = [],                  // <- parent-provided rows (preferred)
  onSelectionChange = () => {}, // <- notify parent of selected IDs
}) {
  // Fallback mock data if no rows are provided
  const fallback = [
    {
      id: "u1",
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
      id: "u2",
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
      id: "u3",
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
      id: "u4",
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

  // Use parent rows if given, else fallback mock
  const data = (Array.isArray(rows) && rows.length ? rows : fallback).map((u, idx) => ({
    // Ensure each row has a stable id
    id: u.id ?? u.user_id ?? u.email ?? String(idx),
    ...u,
  }));

  // Filters
  const filteredUsers = useMemo(() => {
    return data.filter((u) => {
      const roleMatch =
        option === "All" || !option ? true : (u.role || "").toLowerCase() === option.toLowerCase();
      const typeMatch =
        type === "All" || !type ? true : (u.status || "").toLowerCase() === type.toLowerCase();
      return roleMatch && typeMatch;
    });
  }, [data, option, type]);

  // Selection state (IDs)
  const [selected, setSelected] = useState(() => new Set());

  // Keep selection valid when the filtered list changes
  useEffect(() => {
    const validIds = new Set(filteredUsers.map((u) => u.id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      if (next.size !== prev.size) onSelectionChange([...next]);
      return next;
    });
  }, [filteredUsers, onSelectionChange]);

  // Derived select-all state
  const allIds = useMemo(() => filteredUsers.map((u) => u.id), [filteredUsers]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = !allSelected && allIds.some((id) => selected.has(id));

  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // Toggle helpers
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange([...next]);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      let next;
      if (allSelected) next = new Set(); // clear all
      else next = new Set(allIds);       // select all
      onSelectionChange([...next]);
      return next;
    });
  };

  // Table headers (kept your UI)
  const headers = [
    <input
      key="selectAll"
      ref={selectAllRef}
      type="checkbox"
      checked={allSelected}
      onChange={toggleAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      aria-label="select-all"
    />,
    "Full Name",
    "Email",
    "Role",
    "Status",
    "Actions",
  ];

  return (
    <Table headers={headers}>
      {filteredUsers.map((item) => {
        const checked = selected.has(item.id);
        return (
          <tr
            key={item.id}
            className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
          >
            <td className="px-4 py-3 text-center">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleOne(item.id)}
                className="accent-primaryYellow focus:ring-2 focus:ring-black"
              />
            </td>

            <td className="px-4 py-3 text-center font-medium">
              {(item.firstName || item.first_name || "")} {(item.lastName || item.last_name || "")}
            </td>

            <td className="px-4 py-3 text-center">{item.email}</td>
            <td className="px-4 py-3 text-center">{item.role}</td>

            <td
              className={`px-4 py-3 text-center font-medium ${
                (item.status || "").toLowerCase() === "active" ? "text-green-600" : "text-red-500"
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
        );
      })}
    </Table>
  );
}
