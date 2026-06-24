import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Navbar_Data } from "./NavBar_Data";
import { LuCog } from "react-icons/lu";
import { IoChevronDownOutline } from "react-icons/io5";
import { IoCodeSlash, IoCode } from "react-icons/io5";

import { IoSettingsOutline } from "react-icons/io5";

function Navbar() {
  const [open, setOpen] = useState<string | null>(null); // Dropdown state
  const [collapsed, setCollapsed] = useState(false); // Collapse toggle (xl only)
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile/LG toggle

  const toggleDropdown = (key: string) => {
    setOpen(open === key ? null : key);
  };

  return (
    <>


      {/* Mobile/LG Toggle Button */}
      <div className="fixed top-4 left-4 z-50 xl:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-[#9333EA] text-white p-2 rounded-lg shadow-md">
          {mobileOpen ? <IoCodeSlash size={24} /> : <IoCode size={24} />}
        </button>
      </div>
      {/* Navbar Container */}
      <div
        className={`
          flex flex-col p-3 items-center text-white h-screen overflow-y-auto scrollbar-custom transition-all duration-300
          fixed top-0 left-0 z-40
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          ${collapsed && "xl:w-22"}
          ${!collapsed && "xl:w-75"}
          xl:relative xl:translate-x-0
          ${mobileOpen ? "w-70 bg-[#0D1117]" : ""}
        `}>
        {/* Collapse Toggle (XL only) */}
        <div className="hidden xl:flex justify-end mb-4 self-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-[#9333EA] text-white p-2 rounded-full hover:bg-[#7b22c5] transition duration-200 cursor-pointer"
          >
            {collapsed ? <IoCodeSlash /> : <IoCode />}
          </button>
        </div>

        {/* Logo */}
        <div className="p-5">
          {(!collapsed || mobileOpen) && (
            <h1 className="font-exo font-bold text-5xl">DevLab</h1>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          {Navbar_Data.map((item) => (
            <div key={item.key}>
              {/* Parent Link */}
              <div
                onClick={() => (item.children ? toggleDropdown(item.key) : null)}
              >
                <NavLink
                  to={item.path}
                  className="flex items-center gap-3 font-inter text-[1.2rem] relative rounded px-5 p-3  overflow-hidden group hover:bg-[#9333EA] transition-all ease-out duration-300 NavBarText-laptop">
                  <span className="text-xl">{item.icon}</span>
                  {(!collapsed || mobileOpen) && item.label}
                  {item.children && (!collapsed || mobileOpen) && (
                    <IoChevronDownOutline
                      className={`ml-auto transition-transform duration-300 ${
                        open === item.key ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </NavLink>
              </div>

              {/* Subtopics */}
              {(!collapsed || mobileOpen) && (
                <div
                  className={`ml-10 mt-1 flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
                    open === item.key
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}>
                  {item.children &&
                    item.children.map((sub) => (
                      <NavLink
                        to={sub.path}
                        key={sub.key}
                        className="flex items-center tracking-wide p-2 gap-3 text-[1rem] font-inter hover:bg-[#9333EA] transition-all ease-out duration-300 rounded NavBarText-laptop"
                      >
                        <span className="text-xl">{sub.icon}</span>
                        {sub.label}
                      </NavLink>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Settings */}
        <NavLink
          to="Settings"
          className={({ isActive }) =>
            `flex items-center gap-3 w-full relative font-inter transition-all ease-out duration-300 text-[1.2rem] rounded px-5 py-3 mt-auto mb-2 NavBarText-laptop ${
              isActive 
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                : "text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 border border-transparent"
            }`
          }
        >
          <IoSettingsOutline size={24} className="shrink-0" />
          {(!collapsed || mobileOpen) && <span className="font-medium tracking-wide">Configuration</span>}
        </NavLink>
      </div>
    </>
  );
}

export default Navbar;
