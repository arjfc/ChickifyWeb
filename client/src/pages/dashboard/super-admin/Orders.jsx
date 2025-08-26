import React, { useState } from "react";
import { IoMdOptions } from "react-icons/io";
import OrderTable from "../../../components/super-admin/tables/OrderTable";

export default function Orders() {
  const adminOptions = ["Pending", "Approved", "Rejected"];
  const [selectedAdminOption, setSelectedAdminOption] = useState("Pending");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-5 items-center">
            {adminOptions.map((data) => (
              <div
                onClick={() => setSelectedAdminOption(data)}
                className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
                  selectedAdminOption === data
                    ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
                    : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
                }`}
                key={data}
              >
                {data}
              </div>
            ))}
            <IoMdOptions className="text-lg text-gray-400 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <OrderTable selectedOption={selectedAdminOption} />
      </div>
    </div>
  );
}
