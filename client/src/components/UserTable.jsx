// src/components/UserTable.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { Link } from "react-router-dom";
import Table from "./Table";

export default function UserTable({
  role,
  option = "All", // role filter: All | Admin | Farmer | Buyer
  type = "All", // status filter: All | Active | Inactive | Deactivated
  rows = [], // parent-provided rows
  onSelectionChange = () => {}, // called with array of selected IDs
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

  // 1) Normalize rows only when `rows` changes
  const data = useMemo(() => {
    const source = Array.isArray(rows) && rows.length ? rows : fallback;
    return source.map((u, idx) => ({
      id: u.user_id ?? u.id ?? u.email ?? String(idx), // stable ID
      ...u,
    }));
  }, [rows]);

  // 2) Apply filters, memoized
  const filteredUsers = useMemo(() => {
    return data.filter((u) => {
      const roleMatch =
        option === "All" || !option
          ? true
          : (u.role || "").toLowerCase() === option.toLowerCase();
      const typeMatch =
        type === "All" || !type
          ? true
          : (u.status || "").toLowerCase() === type.toLowerCase();
      return roleMatch && typeMatch;
    });
  }, [data, option, type]);

  // 3) Selection state (set of IDs)
  const [selectedIdsSet, setSelectedIdsSet] = useState(new Set());

  // keep selection in sync if rows change (remove IDs that no longer exist)
  useEffect(() => {
    const validIds = new Set(filteredUsers.map((u) => u.id));
    setSelectedIdsSet((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      if (next.size !== prev.size) {
        onSelectionChange(Array.from(next));
      }
      return next;
    });
  }, [filteredUsers, onSelectionChange]);

  // derived values
  const allRowIds = useMemo(
    () => filteredUsers.map((u) => u.id),
    [filteredUsers]
  );
  const allSelected =
    allRowIds.length > 0 && allRowIds.every((id) => selectedIdsSet.has(id));
  const someSelected =
    !allSelected && allRowIds.some((id) => selectedIdsSet.has(id));

  // handle indeterminate state for checkbox
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // toggle one row
  const toggleOne = (id) => {
    setSelectedIdsSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange(Array.from(next));
      return next;
    });
  };

  // toggle all rows
  const toggleAll = () => {
    setSelectedIdsSet((prev) => {
      let next;
      if (allSelected) {
        next = new Set(); // clear all
      } else {
        next = new Set(allRowIds); // select all
      }
      onSelectionChange(Array.from(next));
      return next;
    });
  };

  // Table headers
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
        const checked = selectedIdsSet.has(item.id);
        const first = item.firstName || item.first_name || "";
        const last = item.lastName || item.last_name || "";

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
              {first} {last}
            </td>

            <td className="px-4 py-3 text-center">{item.email}</td>
            <td className="px-4 py-3 text-center">{item.role}</td>

            <td
              className={`px-4 py-3 text-center font-medium ${
                (item.status || "").toLowerCase() === "active"
                  ? "text-green-600"
                  : "text-red-500"
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
