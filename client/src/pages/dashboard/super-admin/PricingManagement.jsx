import { FaCircleInfo } from "react-icons/fa6";
import SmallCard from "../../../components/super-admin/SmallCard";
import PriceTable from "../../../components/admin/tables/PriceTable";
import Modal from "react-modal";
import { useState } from "react";

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 10,
    maxHeight: "100vh",
    width: "25vw",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

const modalStyle2 = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 10,
    maxHeight: "100vh",
    width: "25vw",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

const sizes = [
  {
    size: "Extra Large",
    id: "xl",
    number: 220,
  },
  {
    size: "Large",
    id: "lg",
    number: 200,
  },
  {
    size: "Medium",
    id: "md",
    number: 180,
  },
  {
    size: "Small",
    id: "sm",
    number: 150,
  },
  {
    size: "Extra Small",
    id: "xs",
    number: 120,
  },
];

export default function PriceManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInfoModal = () => {
    setIsInfoModalOpen(!isInfoModalOpen);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-lg">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-2xl text-primaryYellow font-semibold">
              Current Base Price of Tray
            </h1>
            <FaCircleInfo
              onClick={handleInfoModal}
              className="text-lg text-gray-400 cursor-pointer"
            />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-5">
          {sizes.map((data) => (
            <SmallCard
              size={data.size}
              id={data.id}
              key={data.id}
              number={data.number}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-5 items-center text-primaryYellow text-3xl font-bold">
            <h1>Current Base Price Management</h1>
          </div>
          <div
            onClick={handleModal}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-lg">Edit Base Price</p>
          </div>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
          <PriceTable />
        </div>
      </div>
      <Modal isOpen={isModalOpen} style={modalStyle}>
        <div className="flex flex-col px-5 py-10 gap-2">
          <h1 className="text-primaryYellow font-bold text-xl text-center">
            Edit Final Base Price
          </h1>
          {[...Array(6)].map((_, index) => (
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-gray-400 font-bold">
                Extra Large
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 drop-shadow-custom shadow-md"
              />
            </div>
          ))}
          <div className="flex flex-row items-center justify-between gap-5">
            <div
              onClick={handleModal}
              className="flex-1 text-center bg-gray-400 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
              <p className="text-base">Cancel</p>
            </div>
            <div
              onClick={handleModal}
              className="flex-1 text-center bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
              <p className="text-base">Save Changes</p>
            </div>
          </div>  
        </div>
      </Modal>
      <Modal isOpen={isInfoModalOpen} style={modalStyle2}>
        <div className="flex flex-col gap-5 items-center justify-center p-6">
          <h1 className="text-primaryYellow font-bold text-xl">
            Price Per Tray
          </h1>
          <p className="font-semibold opacity-70 text-center">
            Price per Tray refers to the cost assigned to one standard tray of
            eggs {"(typically 30 pieces)."} It serves as the base unit for
            pricing in egg sales. This metric is commonly used in poultry
            trading because it standardizes egg pricing, making it simple to
            compare, track, and adjust prices across markets.
          </p>
          <div
            onClick={handleInfoModal}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90 w-full text-center"
          >
            <p className="text-lg">Okay</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}






// import React, { useState } from "react";
// import { FaCircleInfo } from "react-icons/fa6";
// import SmallCard from "../../../components/super-admin/SmallCard";
// import Modal from "react-modal";

// const modalStyle2 = {
//   content: {
//     top: "50%",
//     left: "50%",
//     right: "auto",
//     bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20,
//     padding: 10,
//     maxHeight: "100vh",
//     width: "25vw",
//     overflow: "visible",
//   },
//   overlay: {
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     zIndex: 1000,
//   },
// };

// const sizes = [
//   { size: "Extra Large", id: "xl", number: 220 },
//   { size: "Large",       id: "lg", number: 200 },
//   { size: "Medium",      id: "md", number: 180 },
//   { size: "Small",       id: "sm", number: 150 },
//   { size: "Extra Small", id: "xs", number: 120 },
// ];

// export default function PricingManagement() {
//   const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
//   const handleInfoModal = () => setIsInfoModalOpen((s) => !s);

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Current Base Price of Tray */}
//       <div className="flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <div className="flex flex-row justify-between items-center">
//           <div className="flex flex-row gap-3 items-center">
//             <h1 className="text-2xl text-primaryYellow font-semibold">
//               Current Base Price of Tray
//             </h1>
//             <FaCircleInfo
//               onClick={handleInfoModal}
//               className="text-lg text-gray-400 cursor-pointer"
//               title="What is Price per Tray?"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
//           {sizes.map((data) => (
//             <SmallCard
//               size={data.size}
//               id={data.id}
//               key={data.id}
//               number={data.number}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Info modal only */}
//       <Modal isOpen={isInfoModalOpen} style={modalStyle2} ariaHideApp={false}>
//         <div className="flex flex-col gap-5 items-center justify-center p-6">
//           <h1 className="text-primaryYellow font-bold text-xl">Price Per Tray</h1>
//           <p className="font-semibold opacity-70 text-center">
//             Price per Tray refers to the cost assigned to one standard tray of
//             eggs (typically 30 pieces). It serves as the base unit for pricing
//             in egg sales. This metric is commonly used in poultry trading
//             because it standardizes egg pricing, making it simple to compare,
//             track, and adjust prices across markets.
//           </p>
//           <div
//             onClick={handleInfoModal}
//             className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90 w-full text-center"
//           >
//             <p className="text-lg">Okay</p>
//           </div>
//         </div>
//       </Modal>

      
//     </div>
//   );
// }

