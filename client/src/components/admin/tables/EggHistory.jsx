import React, { useState } from "react";
import Table from "../../Table";

export default function EggHistory() {
    const discounts = [
      {
        farmer: "Justin Beiber",
        datePickup: "10/10/25",
        qty: "30",
        size: "Medium",
      },
      {
        farmer: "Justin Beiber",
        datePickup: "10/10/25",
        qty: "30",
        size: "Large",
      },
      {
        farmer: "Justin Beiber",
        datePickup: "10/10/25",
        qty: "30",
        size: "Small",
      },
      {
        farmer: "Justin Beiber",
        datePickup: "10/10/25",
        qty: "30",
        size: "Medium",
      },
    ];
  
    const headers = [
      "Farmer",
      "Date Pickup",
      "Quantity (Tray Bundle)",
      "Egg Size",
    ];
  

    return (
      <Table headers={headers}>
        {discounts.map((item, index) => (
          <tr
            key={index}
            className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm transition"
          >
           
            <td className="px-4 py-3 text-center font-medium">{item.farmer}</td>
            <td className="px-4 py-3 text-center">{item.datePickup}</td>
            <td className="px-4 py-3 text-center">{item.qty}</td>
            <td className="px-4 py-3 text-center">{item.size}</td>
          </tr>
        ))}
      </Table>
    );
  }
  