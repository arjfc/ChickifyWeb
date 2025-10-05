  import React, { useMemo, useState } from "react";

  const MOCK_ROWS = [
    { id: "1", farmer: "Maria Lopez",   brand: "B-MEG",     type: "Layer Mash",      remainingKg: 120, allocatedKg: 50, allocationDate: "2025-10-01" },
    { id: "2", farmer: "Juan Dela Cruz",brand: "PilMico",   type: "Grower Pellets",  remainingKg: 85,  allocatedKg: 20, allocationDate: "2025-10-02" },
    { id: "3", farmer: "Flynn Roger",   brand: "Vitarich",  type: "Starter Crumble", remainingKg: 60,  allocatedKg: 15, allocationDate: "2025-10-03" },
    { id: "4", farmer: "Ana Santos",    brand: "Universal", type: "Layer Mash",      remainingKg: 140, allocatedKg: 40, allocationDate: "2025-10-03" },
    { id: "5", farmer: "Carlos Reyes",  brand: "B-MEG",     type: "Finisher Pellet", remainingKg: 98,  allocatedKg: 25, allocationDate: "2025-10-04" },
  ];

  export default function FeedMonitoringTable() {
    const [rows] = useState(MOCK_ROWS);
    const [selected, setSelected] = useState(new Set());
    const ids = useMemo(() => rows.map((r) => r.id), [rows]);
    const allChecked = selected.size > 0 && selected.size === rows.length;

    const toggleAll = () => setSelected(allChecked ? new Set() : new Set(ids));
    const toggleOne = (id) => {
      const next = new Set(selected);
      next.has(id) ? next.delete(id) : next.add(id);
      setSelected(next);
    };

    const header = "text-[#F6C32B] text-[16px] font-semibold";
    const cell = "text-[16px] text-gray-700 bg-[#faf4df] px-2 py-4";    
    const grid = "grid grid-cols-[1.15fr_0.9fr_1fr_1.05fr_1.15fr_1.05fr_40px] items-center";

    return (
      // Card wrapper
      <div className="mt-6 rounded-lg bg-white border border-gray-300 shadow-sm pb-5 ">
        {/* Header */}
        <div className={`px-6 py-4 ${grid}`}>
          <div className={header}>Farmer</div>
          <div className={header}>Feed Brand</div>
          <div className={header}>Feed Type</div>
          {/* Center these two headers */}
          <div className={`${header} text-center`}>Remaining Feeds (kg)</div>
          <div className={`${header} text-center`}>Allocated Feeds (kg)</div>
          <div className={header}>Allocation Date</div>
          <div className="flex justify-evenly">
            <input
              type="checkbox"
              aria-label="Select all"
              onChange={toggleAll}
              checked={allChecked}
              className="h-4 w-4 accent-[#F6C32B] cursor-pointer"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-gray-400" />

        {/* Rows */}
        <div>
          {rows.map((r) => (
            <div key={r.id} className={`px-6 py-2 ${grid} `}>
              <div className={cell}>{r.farmer}</div>
              <div className={cell}>{r.brand}</div> 
              <div className={cell}>{r.type}</div>
              {/* Center these two cells */}
              <div className={`${cell} text-center`}>{r.remainingKg}</div>
              <div className={`${cell} text-center`}>{r.allocatedKg}</div>
              <div className={cell}>
                {new Date(r.allocationDate).toLocaleDateString("en-US")}
              </div>
                <div className={`${cell} flex justify-evenly`}>                
                  <input
                  type="checkbox"
                  aria-label={`Select ${r.id}`}
                  onChange={() => toggleOne(r.id)}
                  checked={selected.has(r.id)}
                  className="h-4 w-4 accent-[#F6C32B] cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
