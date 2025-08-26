import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiMenu, FiChevronLeft, FiChevronDown } from "react-icons/fi";
import ChickyLogo from "../assets/CHICKIFY-SMALL.png";
import { sidebarItems } from "../constants/sideBar";
import { IoLogOutOutline } from "react-icons/io5";
import Modal from "react-modal";
import { useAuth } from "../context/AuthContext";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: "1rem",
    width: "clamp(20rem, 50%, 20rem)",
    height: "auto",
    padding: "0",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [modalIsOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");

  function openModal() {
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
  }

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? "" : label));
    if (!isOpen) setIsOpen(true);
  };

  const isParentActive = (item) => {
    if (!item.children) return false;
    return item.children.some(
      (child) => location.pathname === child.path[user.role]
    );
  };

  return (
    <>
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-screen bg-primaryYellow flex flex-col transition-all duration-300 
        ${isOpen ? "w-[16rem] rounded-tr-3xl rounded-br-3xl" : "w-[7.5rem] rounded-r-3xl"}`}
      >
        {/* Top Section */}
        <div className="p-5 flex items-center justify-center relative shrink-0">
          <img
            src={ChickyLogo}
            alt="Chickify"
            className={`transition-all duration-300 object-contain
            ${isOpen ? "w-[5rem] h-[5rem]" : "w-[3.5rem] h-[3rem] mx-auto"}`}
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`${
              isOpen ? "text-2xl" : "text-lg"
            } text-white cursor-pointer focus:outline-none absolute top-5 right-[-20px] p-3 bg-secondaryYellow rounded-full`}
          >
            {isOpen ? <FiChevronLeft /> : <FiMenu />}
          </button>
        </div>

        {/* Scrollable Middle Section */}
        <div className={`flex-1 ${isOpen && 'overflow-y-auto overflow-x-hidden'}  px-5`}>
          <ul
            className={`space-y-2 ${
              isOpen ? "" : "flex flex-col justify-center items-center"
            }`}
          >
            {sidebarItems
              .filter((item) => item.roles.includes(user.role))
              .map((item, index) => {
                const path =
                  typeof item.path === "string"
                    ? item.path
                    : item.path?.[user.role];

                // Dropdown item
                if (item.children) {
                  const parentActive = isParentActive(item);
                  return (
                    <li key={index}>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`flex items-center cursor-pointer ${
                          isOpen ? "justify-between" : "justify-center"
                        } w-full px-3 py-2 rounded-lg transition-colors duration-200
                        ${
                          parentActive && isOpen
                            ? "bg-white text-primaryYellow font-semibold"
                            : "text-black hover:bg-yellow-400"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 ${
                            parentActive && !isOpen
                              ? "bg-white text-primaryYellow font-semibold px-3 py-2 rounded-lg"
                              : "text-black"
                          }`}
                        >
                          <item.icon
                            className={`transition-all duration-300 ${
                              isOpen ? "w-6 h-6" : "w-7 h-7"
                            }`}
                          />
                          {isOpen && <span>{item.label}</span>}
                        </div>
                        {isOpen && (
                          <span
                            className={`transform transition-transform duration-300 text-black ${
                              openDropdown === item.label
                                ? "rotate-180"
                                : "rotate-0"
                            }`}
                          >
                            <FiChevronDown />
                          </span>
                        )}
                      </button>

                      {/* Dropdown Items */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openDropdown === item.label && isOpen
                            ? "max-h-60 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <ul className="ml-8 mt-2 space-y-2">
                          {item.children.map((child, idx) => (
                            <li key={idx}>
                              <NavLink
                                to={child.path[user.role]}
                                className={({ isActive }) =>
                                  `block px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                                    isActive
                                      ? "bg-white text-primaryYellow font-semibold"
                                      : "text-black hover:bg-yellow-400"
                                  }`
                                }
                              >
                                {child.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                }

                // Normal single link
                return (
                  <li key={index}>
                    <NavLink
                      to={path}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                          isActive
                            ? "bg-white text-primaryYellow font-semibold"
                            : "text-black hover:bg-yellow-400"
                        }`
                      }
                      onClick={() => setOpenDropdown("")}
                    >
                      <item.icon
                        className={`transition-all duration-300 ${
                          isOpen ? "w-6 h-6" : "w-7 h-7"
                        }`}
                      />
                      {isOpen && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Bottom Section */}
        <div
          className={`flex flex-col ${
            isOpen ? "items-start px-5" : "items-center"
          } justify-end gap-3 py-5 shrink-0`}
        >
          <div
            className="flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-white/50 rounded-lg"
            onClick={openModal}
          >
            <IoLogOutOutline className={`${isOpen ? "w-6 h-6" : "w-7 h-7"}`} />
            {isOpen && <span>Logout</span>}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Logout Modal"
        style={customStyles}
      >
        <div className="text-center flex flex-col gap-5 justify-center items-center p-10">
          <div className="flex flex-col leading-tight">
            <h1 className="font-bold text-2xl">Logout</h1>
            <p className="text-black opacity-80 text-base">
              Are you sure you want to logout?
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              className="bg-primaryYellow rounded-lg px-6 py-2 text-white text-lg cursor-pointer hover:bg-yellow-500 transition"
              onClick={closeModal}
            >
              No, Cancel
            </button>
            <button
              className="border border-primaryYellow text-primaryYellow shadow-md rounded-lg px-6 py-2 text-lg cursor-pointer hover:opacity-80"
              onClick={logout}
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
