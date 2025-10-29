// components/admin/tables/SelectedOrderCard.jsx
import React, { useEffect, useState } from "react";
import { getOrderSizeRequirements } from "@/services/OrderNAllocation";

export default function SelectedOrderCard({ orderId }) {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    
    (async () => {
      try {
        setLoading(true);
        const data = await getOrderSizeRequirements(orderId);
        if (alive) setNeeds(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    
    return () => { alive = false; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="text-sm text-gray-500">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Order #{orderId} • To Ship
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select egg supply below to allocate
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Needs:</span>
          {needs.length === 0 ? (
            <span className="text-sm text-gray-500">No size requirements</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {needs.map((n) => (
                <span 
                  key={n.sizeId} 
                  className="inline-flex items-center px-3 py-1 rounded-full bg-white border-2 border-blue-400 text-blue-700 font-semibold text-sm"
                >
                  {n.sizeLabel} × {n.trays} {n.trays === 1 ? 'tray' : 'trays'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}