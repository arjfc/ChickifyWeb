// import React, { useEffect, useState, useMemo } from "react";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import { DatePicker } from "@mui/x-date-pickers";
// import ExpenseTable from "../../../components/admin/tables/ExpenseTable";
// import Modal from "react-modal";
// import { addExpense, fetchExpenseCategories, fetchFeedBrands, fetchFeedTypesByBrand} from "../../../services/Expenses";

// Modal.setAppElement("#root");

// export default function ExpensePage() {
//   const [date, setDate] = useState(null);
//   const [status, setStatus] = useState("All");

//   const [selectedCountAdmin, setSelectedCountAdmin] = useState(0);
//   const [selectedCountFarmers, setSelectedCountFarmers] = useState(0);

//   const [categories, setCategories] = useState([]);
//   const [filterExpCategId, setFilterExpCategId] = useState("");

//   // Form (modal) category
//   const [formExpCategId, setFormExpCategId] = useState("");
//   // trigger table reloads
//   const [refreshKey, setRefreshKey] = useState(0);

//   const [showAddModal, setShowAddModal] = useState(false);
//   const [amount, setAmount] = useState("");
  
//   const [feedBrands, setFeedBrands] = useState([]);          // ["B-MEG Integra", ...]
//   const [selectedBrand, setSelectedBrand] = useState("");    // brand string
//   const [brandFeedTypes, setBrandFeedTypes] = useState([]);  // [{feed_type_id, name, ...}]
//   const [selectedFeedTypeId, setSelectedFeedTypeId] = useState(""); // FK to pass to RPC

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingExpense, setEditingExpense] = useState(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         const rows = await fetchExpenseCategories();
//         setCategories(rows);
//         // preload brands for the Feed modal
//        const brands = await fetchFeedBrands();
//        setFeedBrands(brands);
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, []);

//   const btnClass =
//     "h-[42px] flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-sm hover:border-primaryYellow hover:text-primaryYellow transition";

//   const selectedCategoryForm = useMemo(
//     () => categories.find((c) => c.exp_categ_id === Number(formExpCategId)),
//     [categories, formExpCategId]
//   );
//   const isFeed = (selectedCategoryForm?.exp_categ_name || "").toLowerCase() === "feed";

//   const canSubmit = isFeed
//     ? Number(amount) > 0 && Number(feedQty) > 0 && !!FeedBrand && !!FeedName
//     : Number(formExpCategId) > 0 && Number(amount) > 0;

//   // Filter dropdown handler (tables)
//   const handleFilterCategoryChange = (val) => {
//     setFilterExpCategId(val);
//   };

//   // Add/Edit form category handler (modal)
//   const handleFormCategoryChange = (val) => {
//     setFormExpCategId(val);
//     const nextIsFeed =
//       (categories.find((c) => c.exp_categ_id === Number(val))?.exp_categ_name || "")
//         .toLowerCase() === "feed";
//     if (!nextIsFeed) {
//     setSelectedBrand("");
//     setBrandFeedTypes([]);
//     setSelectedFeedTypeId("");
//     }
//   };

//   // Call this in the Feed section when brand changes
//   const handleBrandChange = async (brand) => {
//     setSelectedBrand(brand);
//     setSelectedFeedTypeId("");      // reset currently picked feed name
//     if (!brand) {
//       setBrandFeedTypes([]);
//       return;
//     }
//     try {
//       const types = await fetchFeedTypesByBrand(brand);
//       setBrandFeedTypes(types);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleAddExpense = async (e) => {
//     e.preventDefault();
//     if (!canSubmit) return;

//     try {
//       if (isFeed) {
//         const expense_date =
//           date && typeof date?.format === "function" ? date.format("YYYY-MM-DD") : undefined;

//         const feed_type_id = Number(selectedFeedTypeId);
//         const unit_price = Number(amount) && Number(feedQty) ? Number(amount) / Number(feedQty) : null;

//         const { expenses_id, purchase_id } = await addFeedExpense({
//           exp_categ_id: Number(formExpCategId),
//           amount: Number(amount),
//           feed_type_id,
//           qty_kg: Number(feedQty),
//           unit_price,
//           date: expense_date,
//         });
//           console.log("Feed expense saved:", { expenses_id, purchase_id });
//         } else {
//         // hook your 'Feed' flow here if needed
//         console.log("Feed expense (no RPC):", {
//           exp_categ_id: Number(formExpCategId),
//           amount: Number(amount),
//           feed_qty_kg: Number(feedQty),
//           feed_brand: FeedBrand,
//           feed_name: FeedName,
//         });
//       }

//       setShowAddModal(false);
//       // optionally lock the table filter to what was added:
//       setFilterExpCategId(String(formExpCategId || ""));
//       // form resets
//       setFormExpCategId("");
//       setAmount("");
//       setFeedQty("");
//       setSelectedBrand("");
//       setBrandFeedTypes([]);
//       setSelectedFeedTypeId("");
//       setDate(null);
//       // trigger both tables to reload
//       setRefreshKey((k) => k + 1);
//     } catch (err) {
//       console.error(err);
//       alert(err.message || "Failed to add expense");
//     }
//   };

//   const handleUpdateExpense = (e) => {
//     e.preventDefault();
//     if (!canSubmit) return;

//     const updated = isFeed
//       ? {
//           ...editingExpense,
//           exp_categ_id: Number(formExpCategId),
//           amount: Number(amount),
//           feed_qty_kg: Number(feedQty),
//           feed_brand: FeedBrand,
//           feed_name: FeedName,
//         }
//       : {
//           ...editingExpense,
//           exp_categ_id: Number(formExpCategId),
//           amount: Number(amount),
//           feed_qty_kg: null,
//           feed_brand: null,
//           feed_name: null,
//         };

//     console.log("Updated (UI only):", updated);

//     setShowEditModal(false);
//     setEditingExpense(null);
//     setFormExpCategId("");
//     setAmount("");
//     setFeedQty("");
//     setFeedBrand("");
//     setFeedName("");
//   };

//   const closeAdd = () => setShowAddModal(false);
//   const closeEdit = () => {
//     setShowEditModal(false);
//     setEditingExpense(null);
//   };

//   const handleEditFromTable = (expense) => {
//     setEditingExpense(expense);
//     const byName = categories.find((c) => c.exp_categ_name === expense.category);
//     setFormExpCategId(byName ? String(byName.exp_categ_id) : "");
//     setAmount(String(expense.amount ?? ""));
//     setFeedQty(
//       (expense.category || "").toLowerCase() === "feed" && expense.feed_qty_kg != null
//         ? String(expense.feed_qty_kg)
//         : ""
//     );
//     setFeedBrand(expense.feed_brand ?? "");
//     setFeedName(expense.feed_name ?? "");
//     setShowEditModal(true);
//   };

//   const fromStr = date?.format ? date.format("YYYY-MM-DD") : undefined;
//   const toStr = date?.format ? date.format("YYYY-MM-DD") : undefined;

//   return (
//     <div className="grid grid-cols-1 gap-6">
//       {/* Filters row */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setStatus(status)}
//             className="h-[42px] flex items-center justify-between rounded-xl 
//                border border-primaryYellow text-primaryYellow px-4 text-sm font-semibold 
//                transition hover:bg-primaryYellow hover:text-white"
//           >
//             <span>{status}</span>
//             <MdKeyboardArrowDown className="ml-2 text-lg" />
//           </button>

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

//           {/* Category Filter (tables) */}
//           <select
//             value={filterExpCategId}
//             onChange={(e) => handleFilterCategoryChange(e.target.value)}
//             className="h-[42px] rounded-xl border border-gray-300 bg-white px-4 text-sm"
//           >
//             <option value="">All Categories</option>
//             {categories.map((c) => (
//               <option key={c.exp_categ_id} value={c.exp_categ_id}>
//                 {c.exp_categ_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           type="button"
//           className="h-[42px] rounded-xl bg-primaryYellow px-6 text-base font-semibold text-white hover:brightness-95 shadow"
//           onClick={() => setShowAddModal(true)}
//         >
//           Add Expense
//         </button>
//       </div>

//       {/* Admin Expenses */}
//       <div className="rounded-xl bg-white shadow-2xl">
//         <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-800">Admin Expenses</h3>
//           <span className="text-sm text-gray-500">Selected: {selectedCountAdmin}</span>
//         </div>
//         <div className="px-4 py-2">
//           <ExpenseTable
//             scope="admin"
//             from={fromStr}
//             to={toStr}
//             expCategId={Number(filterExpCategId) || undefined}
//             refreshKey={refreshKey}
//             onSelectionChange={setSelectedCountAdmin}
//             onEdit={handleEditFromTable}
//           />
//         </div>
//       </div>

//       {/* Farmers’ Expenses */}
//       <div className="rounded-xl bg-white shadow-2xl">
//         <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-800">Farmers’ Expenses</h3>
//           <span className="text-sm text-gray-500">Selected: {selectedCountFarmers}</span>
//         </div>
//         <div className="px-4 py-2">
//           <ExpenseTable
//             scope="farmers"
//             from={fromStr}
//             to={toStr}
//             expCategId={Number(filterExpCategId) || undefined}
//             refreshKey={refreshKey}
//             onSelectionChange={setSelectedCountFarmers}
//             onEdit={handleEditFromTable}
//           />
//         </div>
//       </div>

//       {/* Add Expense Modal */}
//       <Modal
//         isOpen={showAddModal}
//         onRequestClose={closeAdd}
//         style={{
//           overlay: { backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000 },
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
//             {/* Category (IDs from DB) */}
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-gray-700">
//                 Category
//               </label>
//               <select
//                 value={formExpCategId}
//                 onChange={(e) => handleFormCategoryChange(e.target.value)}
//                 className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//               >
//                 <option value="" disabled>
//                   Select Category
//                 </option>
//                 {categories.map((c) => (
//                   <option key={c.exp_categ_id} value={c.exp_categ_id}>
//                     {c.exp_categ_name}
//                   </option>
//                 ))}
//               </select>
//             </div>


//             {/* Feed-only fields */}
//             {isFeed && (
//               <>
//                 {/* Feed Brand (from DB) */}
//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     Feed Brand
//                   </label>
//                   <select
//                     value={selectedBrand}
//                     onChange={(e) => handleBrandChange(e.target.value)}
//                     className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   >
//                     <option value="" disabled>
//                       Select Feed Brand
//                     </option>
//                     {feedBrands.map((b) => (
//                       <option key={b} value={b}>
//                         {b}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Feed Name (auto-populates from brand) */}
//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     Feed Name
//                   </label>
//                   <select
//                     value={selectedFeedTypeId}
//                     onChange={(e) => setSelectedFeedTypeId(e.target.value)}
//                     disabled={!selectedBrand}
//                     className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-60"
//                   >
//                     <option value="" disabled>
//                       {selectedBrand ? "Select Feed Name" : "Select a brand first"}
//                     </option>
//                     {brandFeedTypes.map((ft) => (
//                       <option key={ft.feed_type_id} value={ft.feed_type_id}>
//                         {ft.name} {ft.form ? `(${ft.form})` : ""}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Feed Quantity (kg) */}
//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     Feed Quantity (kg)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={feedQty}
//                     onChange={(e) => setFeedQty(e.target.value)}
//                     placeholder="Enter quantity in kg"
//                     className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   />
//                 </div>
//               </>
//             )}


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

//             <div className="mt-3 grid grid-cols-2 gap-4">
//               <button
//                 type="button"
//                 onClick={closeAdd}
//                 className="h-11 rounded-xl bg-gray-400 text-base font-semibold text-white hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={!canSubmit}
//                 className={`h-11 rounded-xl text-base font-semibold text-white transition ${
//                   canSubmit ? "hover:brightness-95" : "cursor-not-allowed"
//                 }`}
//                 style={{ backgroundColor: "#FEC619" }}
//               >
//                 Add
//               </button>
//             </div>
//           </form>
//         </div>
//       </Modal>

//       {/* Edit Modal (unchanged logic) */}
//       <Modal
//         isOpen={showEditModal}
//         onRequestClose={closeEdit}
//         style={{
//           overlay: { backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000 },
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
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-gray-700">
//                 Category
//               </label>
//               <select
//                 value={formExpCategId}
//                 onChange={(e) => handleFormCategoryChange(e.target.value)}
//                 className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//               >
//                 <option value="" disabled>
//                   Select Category
//                 </option>
//                 {categories.map((c) => (
//                   <option key={c.exp_categ_id} value={c.exp_categ_id}>
//                     {c.exp_categ_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {isFeed && (
//               <>
//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     Feed Brand
//                   </label>
//                   <select
//                     value={FeedBrand}
//                     onChange={(e) => setFeedBrand(e.target.value)}
//                     className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   >
//                     <option value="" disabled>
//                       Select Feed Brand
//                     </option>
//                     <option value="B-MEG">B-MEG</option>
//                     <option value="PilMico">PilMico</option>
//                     <option value="Vitarich">Vitarich</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     Feed Name
//                   </label>
//                   <input
//                     type="text"
//                     value={FeedName}
//                     onChange={(e) => setFeedName(e.target.value)}
//                     placeholder="Enter Feed Name"
//                     className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   />
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     Feed Quantity (kg)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={feedQty}
//                     onChange={(e) => setFeedQty(e.target.value)}
//                     placeholder="Enter quantity in kg"
//                     className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   />
//                 </div>
//               </>
//             )}

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

//             <div className="mt-3 grid grid-cols-2 gap-4">
//               <button
//                 type="button"
//                 onClick={closeEdit}
//                 className="h-11 rounded-xl bg-gray-300 text-base font-semibold text-white hover:bg-gray-400"
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
//                 Update
//               </button>
//             </div>
//           </form>
//         </div>
//       </Modal>
//     </div>
//   );
// }
// pages/dashboard/admin/ExpensePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers";
import ExpenseTable from "../../../components/admin/tables/ExpenseTable";
import Modal from "react-modal";
import {
  addExpense,
  addFeedExpense,                     // ✅ import this
  fetchExpenseCategories,
  fetchFeedBrands,
  fetchFeedTypesByBrand,
} from "../../../services/Expenses";

Modal.setAppElement("#root");

export default function ExpensePage() {
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState("All");

  const [selectedCountAdmin, setSelectedCountAdmin] = useState(0);
  const [selectedCountFarmers, setSelectedCountFarmers] = useState(0);

  const [categories, setCategories] = useState([]);
  const [filterExpCategId, setFilterExpCategId] = useState("");

  // Form (modal) category
  const [formExpCategId, setFormExpCategId] = useState("");
  // trigger table reloads
  const [refreshKey, setRefreshKey] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState("");

  // ✅ feed qty state (missing before)
  const [feedQty, setFeedQty] = useState("");

  // ✅ dynamic feed dropdowns
  const [feedBrands, setFeedBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [brandFeedTypes, setBrandFeedTypes] = useState([]);
  const [selectedFeedTypeId, setSelectedFeedTypeId] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchExpenseCategories();
        setCategories(rows);
        const brands = await fetchFeedBrands();
        setFeedBrands(brands);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const btnClass =
    "h-[42px] flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-sm hover:border-primaryYellow hover:text-primaryYellow transition";

  const selectedCategoryForm = useMemo(
    () => categories.find((c) => c.exp_categ_id === Number(formExpCategId)),
    [categories, formExpCategId]
  );
  const isFeed = (selectedCategoryForm?.exp_categ_name || "").toLowerCase() === "feed";

  // ✅ validation now uses the new vars
  const canSubmit = isFeed
    ? Number(amount) > 0 &&
      Number(feedQty) > 0 &&
      !!selectedBrand &&
      !!selectedFeedTypeId
    : Number(formExpCategId) > 0 && Number(amount) > 0;

  // Filters
  const handleFilterCategoryChange = (val) => setFilterExpCategId(val);

  // Form category change
  const handleFormCategoryChange = (val) => {
    setFormExpCategId(val);
    const nextIsFeed =
      (categories.find((c) => c.exp_categ_id === Number(val))?.exp_categ_name || "")
        .toLowerCase() === "feed";
    if (!nextIsFeed) {
      // reset feed-only fields
      setFeedQty("");
      setSelectedBrand("");
      setBrandFeedTypes([]);
      setSelectedFeedTypeId("");
    }
  };

  // Brand -> fetch feed names/types
  const handleBrandChange = async (brand) => {
    setSelectedBrand(brand);
    setSelectedFeedTypeId("");
    if (!brand) {
      setBrandFeedTypes([]);
      return;
    }
    try {
      const types = await fetchFeedTypesByBrand(brand);
      setBrandFeedTypes(types);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const expense_date =
        date && typeof date?.format === "function" ? date.format("YYYY-MM-DD") : undefined;

      if (isFeed) {
        const feed_type_id = Number(selectedFeedTypeId);
        const unit_price =
          Number(amount) && Number(feedQty) ? Number(amount) / Number(feedQty) : null;

        const { expenses_id, purchase_id } = await addFeedExpense({
          exp_categ_id: Number(formExpCategId),
          amount: Number(amount),
          feed_type_id,
          qty_kg: Number(feedQty),
          unit_price,
          date: expense_date,
        });
        console.log("Feed expense saved:", { expenses_id, purchase_id });
      } else {
        const { expenses_id } = await addExpense({
          exp_categ_id: Number(formExpCategId),
          amount: Number(amount),
          expense_date: expense_date,
        });
        console.log("Inserted Expense ID:", expenses_id);
      }

      setShowAddModal(false);
      // optionally lock the table filter to what was added:
      setFilterExpCategId(String(formExpCategId || ""));
      // form resets
      setFormExpCategId("");
      setAmount("");
      setFeedQty("");
      setSelectedBrand("");
      setBrandFeedTypes([]);
      setSelectedFeedTypeId("");
      setDate(null);
      // refresh tables
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add expense");
    }
  };

  const handleUpdateExpense = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // (You haven’t implemented an update RPC yet; this just logs)
    const updated = isFeed
      ? {
          ...editingExpense,
          exp_categ_id: Number(formExpCategId),
          amount: Number(amount),
          feed_qty_kg: Number(feedQty),
          brand: selectedBrand,
          feed_type_id: Number(selectedFeedTypeId || 0),
        }
      : {
          ...editingExpense,
          exp_categ_id: Number(formExpCategId),
          amount: Number(amount),
        };

    console.log("Updated (UI only):", updated);

    setShowEditModal(false);
    setEditingExpense(null);
    setFormExpCategId("");
    setAmount("");
    setFeedQty("");
    setSelectedBrand("");
    setBrandFeedTypes([]);
    setSelectedFeedTypeId("");
  };

  const closeAdd = () => setShowAddModal(false);
  const closeEdit = () => {
    setShowEditModal(false);
    setEditingExpense(null);
  };

  const handleEditFromTable = (expense) => {
    setEditingExpense(expense);
    const byName = categories.find((c) => c.exp_categ_name === expense.category);
    setFormExpCategId(byName ? String(byName.exp_categ_id) : "");
    setAmount(String(expense.amount ?? ""));

    // We likely don't have brand/type info in table rows; start blank
    setFeedQty("");
    setSelectedBrand("");
    setBrandFeedTypes([]);
    setSelectedFeedTypeId("");

    setShowEditModal(true);
  };

  const fromStr = date?.format ? date.format("YYYY-MM-DD") : undefined;
  const toStr = date?.format ? date.format("YYYY-MM-DD") : undefined;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Filters row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStatus(status)}
            className="h-[42px] flex items-center justify-between rounded-xl 
               border border-primaryYellow text-primaryYellow px-4 text-sm font-semibold 
               transition hover:bg-primaryYellow hover:text-white"
          >
            <span>{status}</span>
            <MdKeyboardArrowDown className="ml-2 text-lg" />
          </button>

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

          {/* Category Filter (tables) */}
          <select
            value={filterExpCategId}
            onChange={(e) => handleFilterCategoryChange(e.target.value)}
            className="h-[42px] rounded-xl border border-gray-300 bg-white px-4 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.exp_categ_id} value={c.exp_categ_id}>
                {c.exp_categ_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="h-[42px] rounded-xl bg-primaryYellow px-6 text-base font-semibold text-white hover:brightness-95 shadow"
          onClick={() => setShowAddModal(true)}
        >
          Add Expense
        </button>
      </div>

      {/* Admin Expenses */}
      <div className="rounded-xl bg-white shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Admin Expenses</h3>
          <span className="text-sm text-gray-500">Selected: {selectedCountAdmin}</span>
        </div>
        <div className="px-4 py-2">
          <ExpenseTable
            scope="admin"
            from={fromStr}
            to={toStr}
            expCategId={Number(filterExpCategId) || undefined}
            refreshKey={refreshKey}
            onSelectionChange={setSelectedCountAdmin}
            onEdit={handleEditFromTable}
          />
        </div>
      </div>

      {/* Farmers’ Expenses */}
      <div className="rounded-xl bg-white shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Farmers’ Expenses</h3>
          <span className="text-sm text-gray-500">Selected: {selectedCountFarmers}</span>
        </div>
        <div className="px-4 py-2">
          <ExpenseTable
            scope="farmers"
            from={fromStr}
            to={toStr}
            expCategId={Number(filterExpCategId) || undefined}
            refreshKey={refreshKey}
            onSelectionChange={setSelectedCountFarmers}
            onEdit={handleEditFromTable}
          />
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onRequestClose={closeAdd}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000 },
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
          {/* Category (IDs from DB) */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Category
            </label>
            <select
              value={formExpCategId}
              onChange={(e) => handleFormCategoryChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((c) => (
                <option key={c.exp_categ_id} value={c.exp_categ_id}>
                  {c.exp_categ_name}
                </option>
              ))}
            </select>
          </div>

          {/* Feed-only fields */}
          {isFeed && (
            <>
              {/* Feed Brand (from DB) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Feed Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <option value="" disabled>
                    Select Feed Brand
                  </option>
                  {feedBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feed Name (auto-populates from brand) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Feed Name
                </label>
                <select
                  value={selectedFeedTypeId}
                  onChange={(e) => setSelectedFeedTypeId(e.target.value)}
                  disabled={!selectedBrand}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-60"
                >
                  <option value="" disabled>
                    {selectedBrand ? "Select Feed Name" : "Select a brand first"}
                  </option>
                  {brandFeedTypes.map((ft) => (
                    <option key={ft.feed_type_id} value={ft.feed_type_id}>
                      {ft.name} {ft.form ? `(${ft.form})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feed Quantity (kg) */}
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
            </>
          )}

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

          <div className="mt-3 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={closeAdd}
              className="h-11 rounded-xl bg-gray-400 text-base font-semibold text-white hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`h-11 rounded-xl text-base font-semibold text-white transition ${
                canSubmit ? "hover:brightness-95" : "cursor-not-allowed"
              }`}
              style={{ backgroundColor: "#FEC619" }}
            >
              Add
            </button>
          </div>
        </form>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onRequestClose={closeEdit}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000 },
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
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                value={formExpCategId}
                onChange={(e) => handleFormCategoryChange(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((c) => (
                  <option key={c.exp_categ_id} value={c.exp_categ_id}>
                    {c.exp_categ_name}
                  </option>
                ))}
              </select>
            </div>

            {isFeed && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Feed Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  >
                    <option value="" disabled>
                      Select Feed Brand
                    </option>
                    {feedBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Feed Name
                  </label>
                  <select
                    value={selectedFeedTypeId}
                    onChange={(e) => setSelectedFeedTypeId(e.target.value)}
                    disabled={!selectedBrand}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-60"
                  >
                    <option value="" disabled>
                      {selectedBrand ? "Select Feed Name" : "Select a brand first"}
                    </option>
                    {brandFeedTypes.map((ft) => (
                      <option key={ft.feed_type_id} value={ft.feed_type_id}>
                        {ft.name} {ft.form ? `(${ft.form})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

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
              </>
            )}

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
