import React, { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers";
import ExpenseTable from "../../../components/admin/tables/ExpenseTable";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function ExpensePage() {
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState("All");
  const [selectedCount, setSelectedCount] = useState(0);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [feedQty, setFeedQty] = useState(""); // kg, only for category === "Feed"

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const btnClass =
    "h-[42px] flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-sm hover:border-primaryYellow hover:text-primaryYellow transition";

  const showRemoveActions = selectedCount > 0;

  const requiresFeedQty = category === "Feed";
  const canSubmit =
    !!category &&
    Number(amount) > 0 &&
    (!requiresFeedQty || Number(feedQty) > 0);

  // Handle Add Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload =
      category === "Feed"
        ? { category, amount: Number(amount), feed_qty_kg: Number(feedQty) }
        : { category, amount: Number(amount) };

    console.log("New Expense:", payload);

    setShowAddModal(false);
    setCategory("");
    setAmount("");
    setFeedQty("");
  };

  // Handle Update Expense
  const handleUpdateExpense = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const updated =
      category === "Feed"
        ? {
            ...editingExpense,
            category,
            amount: Number(amount),
            feed_qty_kg: Number(feedQty),
          }
        : { ...editingExpense, category, amount: Number(amount), feed_qty_kg: null };

    console.log("Updated Expense:", updated);

    setShowEditModal(false);
    setEditingExpense(null);
    setCategory("");
    setAmount("");
    setFeedQty("");
  };

  // Helpers
  const closeAdd = () => {
    setShowAddModal(false);
    // do not clear to let user resume if needed; but you can clear if preferred:
    // setCategory(""); setAmount(""); setFeedQty("");
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditingExpense(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Filters row with actions on the right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status dropdown (static for now) */}
          <button
            onClick={() => setStatus(status)}
            className="h-[42px] flex items-center justify-between rounded-xl 
               border border-primaryYellow text-primaryYellow px-4 text-sm font-semibold 
               transition hover:bg-primaryYellow hover:text-white"
          >
            <span>{status}</span>
            <MdKeyboardArrowDown className="ml-2 text-lg" />
          </button>

          {/* Date control */}
          <div className={btnClass}>
            <DatePicker
              label={null}
              value={date}
              onChange={setDate}
              slotProps={{
                textField: {
                  placeholder: "Date",
                  variant: "standard",
                  InputProps: { disableUnderline: true },
                  sx: { minWidth: 120 },
                },
              }}
            />
          </div>
        </div>

        {/* Right-side actions */}
        {showRemoveActions ? (
          <div className="flex items-center gap-3">
            {/* Outline gray button: Remove All */}
            <button
              type="button"
              className="h-[42px] rounded-xl border-2 px-5 text-base font-semibold bg-transparent hover:bg-gray-50"
              style={{ borderColor: "#9CA3AF", color: "#9CA3AF" }} // Tailwind gray-400
              onClick={() => console.log("Remove All selected")}
            >
              Remove All
            </button>

            {/* Outline red button: Remove */}
            <button
              type="button"
              className="h-[42px] rounded-xl border-2 px-5 text-base font-semibold bg-white hover:bg-red-50"
              style={{ borderColor: "#A70E29", color: "#A70E29" }}
              onClick={() => console.log("Remove selected")}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="h-[42px] rounded-xl bg-primaryYellow px-6 text-base font-semibold text-white hover:brightness-95 shadow"
            onClick={() => setShowAddModal(true)}
          >
            Add Expense
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="rounded-xl bg-white shadow-2xl">
        <div className="px-4 py-2">
          <ExpenseTable
            onSelectionChange={(cnt) => setSelectedCount(cnt)} // top checkbox -> shows Remove buttons
            onEdit={(expense) => {
              setEditingExpense(expense);
              setCategory(expense.category ?? "");
              setAmount(String(expense.amount ?? ""));
              setFeedQty(
                expense.category === "Feed" && expense.feed_qty_kg != null
                  ? String(expense.feed_qty_kg)
                  : ""
              );
              setShowEditModal(true);
            }}
          />
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onRequestClose={closeAdd}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1000,
          },
          content: {
            inset: "50% auto auto 50%",
            transform: "translate(-50%, -50%)",
            border: "none",
            padding: 0,
            background: "transparent",
          },
        }}
      >
        <div className="w-[480px] rounded-2xl bg-white p-7 shadow-2xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-primaryYellow">
            Add New Expenses
          </h2>

          <form onSubmit={handleAddExpense} className="space-y-5">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="Feed">Feed</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Feed Quantity (kg) — only if Feed */}
            {category === "Feed" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Feed Quantity (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={feedQty}
                  onChange={(e) => setFeedQty(e.target.value)}
                  placeholder="Enter quantity in kg"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Buttons */}
            <div className="mt-3 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={closeAdd}
                className="h-11 rounded-xl bg-gray-400 text-base font-semibold text-white hover:bg-gray-400"
              >
                Cancel
              </button>
              <button type="submit" disabled={!canSubmit}
                className="h-11 rounded-xl text-base font-semibold text-white"
                style={{ backgroundColor: "#FEC619" }}>
                  Add
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={showEditModal}
        onRequestClose={closeEdit}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1000,
          },
          content: {
            inset: "50% auto auto 50%",
            transform: "translate(-50%, -50%)",
            border: "none",
            padding: 0,
            background: "transparent",
          },
        }}
      >
        <div className="w-[480px] rounded-2xl bg-white p-7 shadow-2xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-primaryYellow">
            Edit Expense
          </h2>

          <form onSubmit={handleUpdateExpense} className="space-y-5">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="Feed">Feed</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Feed Quantity (kg) — only if Feed */}
            {category === "Feed" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Feed Quantity (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={feedQty}
                  onChange={(e) => setFeedQty(e.target.value)}
                  placeholder="Enter quantity in kg"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Buttons */}
            <div className="mt-3 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={closeEdit}
                className="h-11 rounded-xl bg-gray-300 text-base font-semibold text-white hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`h-11 rounded-xl text-base font-semibold text-white transition ${
                  canSubmit
                    ? "bg-[#FEC619] hover:brightness-95"
                    : "bg-yellow-300 cursor-not-allowed"
                }`}
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}


// import React, { useState } from "react";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import { DatePicker } from "@mui/x-date-pickers";
// import ExpenseTable from "../../../components/admin/tables/ExpenseTable";
// import Modal from "react-modal";

// Modal.setAppElement("#root");

// export default function ExpensePage() {
//   const [date, setDate] = useState(null);
//   const [status, setStatus] = useState("All");
//   const [selectedCount, setSelectedCount] = useState(0);

//   // Add modal state
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [category, setCategory] = useState("");
//   const [amount, setAmount] = useState("");

//   // Edit modal state
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingExpense, setEditingExpense] = useState(null);

//   const btnClass =
//     "h-[42px] flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-sm hover:border-primaryYellow hover:text-primaryYellow transition";

//   const showRemoveActions = selectedCount > 0;
//   const canSubmit = category && Number(amount) > 0;

//   // Handle Add Expense
//   const handleAddExpense = (e) => {
//     e.preventDefault();
//     if (!canSubmit) return;
//     console.log("New Expense:", { category, amount: Number(amount) });
//     setShowAddModal(false);
//     setCategory("");
//     setAmount("");
//   };

//   // Handle Update Expense
//   const handleUpdateExpense = (e) => {
//     e.preventDefault();
//     if (!canSubmit) return;
//     console.log("Updated Expense:", { ...editingExpense, category, amount });
//     setShowEditModal(false);
//     setEditingExpense(null);
//     setCategory("");
//     setAmount("");
//   };

//   return (
//     <div className="grid grid-cols-1 gap-6">
//       {/* Filters row with actions on the right */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Status dropdown */}
//           <button
//             onClick={() => setStatus(status)}
//             className="h-[42px] flex items-center justify-between rounded-xl 
//                border border-primaryYellow text-primaryYellow px-4 text-sm font-semibold 
//                transition hover:bg-primaryYellow hover:text-white"
//           >
//             <span>{status}</span>
//             <MdKeyboardArrowDown className="ml-2 text-lg" />
//           </button>

//           {/* Date control */}
//           <div className={btnClass}>
//             <DatePicker
//               label={null}
//               value={date}
//               onChange={setDate}
//               slotProps={{
//                 textField: {
//                   placeholder: "Date",
//                   variant: "standard",
//                   InputProps: { disableUnderline: true },
//                   sx: { minWidth: 120 },
//                 },
//               }}
//             />
//           </div>
//         </div>

//         {/* Right-side actions */}
//         {showRemoveActions ? (
//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               className="h-[42px] rounded-xl border border-gray-300 text-gray-500 bg-gray-100 px-5 text-base font-semibold hover:bg-gray-200"
//               onClick={() => console.log("Remove All selected")}
//             >
//               Remove All
//             </button>
//             <button
//               type="button"
//               className="h-[42px] rounded-xl border-2 px-5 text-base font-semibold bg-white hover:bg-red-50"
//               style={{ borderColor: "#A70E29", color: "#A70E29" }}
//               onClick={() => console.log("Remove selected")}
//             >
//               Remove
//             </button>
//           </div>
//         ) : (
//           <button
//             type="button"
//             className="h-[42px] rounded-xl bg-primaryYellow px-6 text-base font-semibold text-white hover:brightness-95 shadow"
//             onClick={() => setShowAddModal(true)}
//           >
//             Add Expense
//           </button>
//         )}
//       </div>

//       {/* Table card */}
//       <div className="rounded-xl bg-white shadow-2xl">
//         <div className="px-4 py-2">
//           <ExpenseTable
//             onSelectionChange={(cnt) => setSelectedCount(cnt)}
//             onEdit={(expense) => {
//               setEditingExpense(expense);
//               setCategory(expense.category);
//               setAmount(expense.amount);
//               setShowEditModal(true);
//             }}
//           />
//         </div>
//       </div>

//       {/* Add Expense Modal */}
//       <Modal
//         isOpen={showAddModal}
//         onRequestClose={() => setShowAddModal(false)}
//         style={{
//           overlay: {
//             backgroundColor: "rgba(0,0,0,0.7)",
//             zIndex: 1000,
//           },
//           content: {
//             inset: "50% auto auto 50%",
//             transform: "translate(-50%, -50%)",
//             border: "none",
//             padding: 0,
//             background: "transparent",
//           },
//         }}
//       >
//         <div className="w-[480px] rounded-2xl bg-white p-7 shadow-2xl">
//           <h2 className="mb-6 text-center text-2xl font-bold text-primaryYellow">
//             Add New Expenses
//           </h2>

//           <form onSubmit={handleAddExpense} className="space-y-5">
//             {/* Category */}
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-gray-700">
//                 Category
//               </label>
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//               >
//                 <option value="" disabled>
//                   Select Category
//                 </option>
//                 <option value="Feed">Feed</option>
//                 <option value="Transport">Transport</option>
//                 <option value="Utilities">Utilities</option>
//                 <option value="Maintenance">Maintenance</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>

//             {/* Amount */}
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-gray-700">
//                 Amount
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="Enter Amount"
//                 className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//               />
//             </div>

//             {/* Buttons */}
//             <div className="mt-3 grid grid-cols-2 gap-4">
//               <button
//                 type="button"
//                 onClick={() => setShowAddModal(false)}
//                 className="h-11 rounded-xl bg-gray-400 text-base font-semibold text-white hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={!canSubmit}
//                 className={`h-11 rounded-xl text-base font-semibold text-white transition ${
//                   canSubmit
//                     ? "bg-[#FEC619] hover:brightness-95"
//                     : "bg-yellow-300 cursor-not-allowed"
//                 }`}
//               >
//                 Add
//               </button>
//             </div>
//           </form>
//         </div>
//       </Modal>

//       {/* Edit Expense Modal */}
//       <Modal
//         isOpen={showEditModal}
//         onRequestClose={() => setShowEditModal(false)}
//         style={{
//           overlay: {
//             backgroundColor: "rgba(0,0,0,0.7)",
//             zIndex: 1000,
//           },
//           content: {
//             inset: "50% auto auto 50%",
//             transform: "translate(-50%, -50%)",
//             border: "none",
//             padding: 0,
//             background: "transparent",
//           },
//         }}
//       >
//         <div className="w-[480px] rounded-2xl bg-white p-7 shadow-2xl">
//           <h2 className="mb-6 text-center text-2xl font-bold text-primaryYellow">
//             Edit Expense
//           </h2>

//           <form onSubmit={handleUpdateExpense} className="space-y-5">
//             {/* Category */}
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-gray-700">
//                 Category
//               </label>
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//               >
//                 <option value="" disabled>
//                   Select Category
//                 </option>
//                 <option value="Feed">Feed</option>
//                 <option value="Transport">Transport</option>
//                 <option value="Utilities">Utilities</option>
//                 <option value="Maintenance">Maintenance</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>

//             {/* Amount */}
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-gray-700">
//                 Amount
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="Enter Amount"
//                 className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//               />
//             </div>

//             {/* Buttons */}
//             <div className="mt-3 grid grid-cols-2 gap-4">
//               <button
//                 type="button"
//                 onClick={() => setShowEditModal(false)}
//                 className="h-11 rounded-xl bg-gray-300 text-base font-semibold text-white hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="h-11 rounded-xl bg-[#FEC619] text-base font-semibold text-white hover:brightness-95"
//               >
//                 Update
//               </button>
//             </div>
//           </form>
//         </div>
//       </Modal>
//     </div>
//   );
// }
