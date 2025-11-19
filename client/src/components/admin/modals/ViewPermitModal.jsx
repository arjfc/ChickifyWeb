// src/components/admin/modals/FarmerPermitModal.jsx
import React from "react";

export default function FarmerPermitModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  const imageUrl =
    request.permit_image_url ||
    request.permit_url ||
    request.business_permit_url ||
    null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close permit"
      />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Business Permit
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 border">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Business permit"
              className="max-h-[80vh] w-auto object-contain"
            />
          ) : (
            <div className="text-xs text-gray-500 p-4 text-center">
              No permit image available for this farmer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// // src/components/admin/modals/FarmerPermitModal.jsx
// import React from "react";

// export default function FarmerPermitModal({ isOpen, onClose, request }) {
//   if (!isOpen || !request) return null;

//   // try a few common keys; adjust based on your actual data shape
//   const imageUrl =
//     request.permit_image_url ||
//     request.permit_url ||
//     request.business_permit_url ||
//     null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
//       role="dialog"
//       aria-modal="true"
//     >
//       {/* Clickable backdrop to close */}
//       <button
//         type="button"
//         className="absolute inset-0 w-full h-full cursor-default"
//         onClick={onClose}
//         aria-label="Close permit"
//       />

//       <div className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-xl p-4 flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-sm font-semibold text-gray-800">
//             Business Permit
//           </h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
//             aria-label="Close"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Image area */}
//         <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 border">
//           {imageUrl ? (
//             <img
//               src={imageUrl}
//               alt="Business permit"
//               className="max-h-[80vh] w-auto object-contain"
//             />
//           ) : (
//             <div className="text-xs text-gray-500 p-4 text-center">
//               No permit image available for this farmer request.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
