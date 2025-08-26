import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NoAccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); 
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">🚫 No Access</h1>
        <p className="text-gray-600">
          You are not authorized to view this page. Redirecting...
        </p>
      </div>
    </div>
  );
}
