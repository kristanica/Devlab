import { useState } from "react";
import {
  HiFolder,
  HiUserCircle,
  HiOutlineArrowLeftOnRectangle,
  HiBars3,
} from "react-icons/hi2";
import { auth } from "../Firebase/Firebase";
import { NavLink, useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // Mobile menu state

  const Logout = async () => {
    try {
      await auth.signOut();
      navigate("/Login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden w-full flex justify-between items-center text-white px-4 mb-3">
        <h1 className="text-3xl font-exo font-bold">DevLab</h1>
        <button onClick={() => setOpen(!open)} className="text-white text-3xl">
          <HiBars3 />
        </button>
      </div>

      {/* SIDEBAR */}
      <div
        className={`
          text-white font-exo flex flex-col h-full
          w-[50%] sm:w-[30%] sm:bg-gray-700  lg:bg-transparent lg:w-[90%]
          fixed lg:static top-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <h1 className="text-[3rem] text-center font-bold mb-5 hidden lg:block">
          DevLab
        </h1>

        <div className="flex-1 flex flex-col gap-7 p-2">
          <NavLink
            to={"/Admin/ContentManagement"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 text-[1.3rem] rounded py-2.5 hover:bg-[#9333EA] transition-all p-5"
          >
            <HiFolder /> Content Management
          </NavLink>

          <NavLink
            to={"/Admin/UserManagement"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 text-[1.3rem] rounded py-2.5 hover:bg-[#9333EA] transition-all p-5"
          >
            <HiUserCircle /> User Management
          </NavLink>
        </div>

        <button
          className="text-[1.3rem] flex items-center gap-5 hover:cursor-pointer"
          onClick={Logout}
        >
          <HiOutlineArrowLeftOnRectangle /> Log Out
        </button>
      </div>

      {/* DARK + BLUR OVERLAY */}
{open && (
  <div
    onClick={() => setOpen(false)}
    className="
      fixed inset-0 z-40bg-black/40 backdrop-blur-smtransition-all duration-300lg:hidden"/>
)}

    </>
  );
}

export default AdminNavbar;
