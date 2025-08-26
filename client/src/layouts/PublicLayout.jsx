import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PublicLayout() {

  const location = useLocation();
  const noFooterRoutes = ["/signin", "/signup"];  
  const hideFooter = noFooterRoutes.includes(location.pathname)
  return (
    <div className="bg-primaryYellow min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
