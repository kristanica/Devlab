// @ts-nocheck
// Utils / Hooks
import useLevelBar from "@/hooks/useLevelBar";
import useFetchUserData from '@/services/api/useFetchUserData';
// Navigation
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
// Icons
import { MdArrowBackIosNew, MdInfoOutline } from "react-icons/md";
import { LuHeart } from "react-icons/lu";
import defaultAvatar from "../../../assets/Images/profile_handler.png";
import React from "react";
import { motion } from "framer-motion";
import { useAttemptStore } from "@/store/useAttemptStore";

interface GameHeaderProps {
  heart?: number;
  setShowPopup?: (val: boolean) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ heart, setShowPopup }) => {
  const { animatedExp } = useLevelBar();
  const { gamemodeId } = useParams();
  const { userData } = useFetchUserData();
  const maxHearts = useAttemptStore((state) => state.maxHearts);

  return (
    <div className="flex justify-between items-center w-full h-12 md:h-14 bg-[#06060a] border-b border-[#1e1e2e] text-slate-200 px-3 md:px-6 py-1 shrink-0 z-20 font-inter">
      
      {/* Left: Back Button & Logo */}
      <div className="flex items-center gap-4">
        <Link
          to="/Main"
          className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#0d0d12] border border-[#2a2a3c] text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
        >
          <MdArrowBackIosNew className="text-xl" />
        </Link>
        <h1 className="text-lg sm:text-xl font-exo font-bold tracking-tight hidden sm:flex items-center gap-2">
          <span className="text-white">DevLab</span>
        </h1>
        {setShowPopup && (
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300"
            title="Show Instructions"
          >
            <MdInfoOutline className="text-xl" />
          </button>
        )}
      </div>

      {/* Center: Hearts */}
      {gamemodeId !== "Lesson" && (
        <div className="flex gap-1 items-center justify-center bg-[#0d0d12] border border-[#2a2a3c] px-3 py-1.5 rounded-lg">
          {[...Array(maxHearts)].map((_, i) => {
            const isFull = i < heart;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`text-xl sm:text-2xl transition-all duration-300 ${
                  isFull ? "text-red-500" : "text-[#1e1e2e]"
                }`}
              >
                <LuHeart className={isFull ? "fill-red-500" : "fill-[#1e1e2e]"} />
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Right: Profile & Exp */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end justify-center hidden sm:flex">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
              Level {userData?.userLevel || 1}
            </span>
            <span className="text-[10px] font-bold text-fuchsia-400">
              {userData?.exp || 0} / 100 XP
            </span>
          </div>
          {/* Progress Bar Container */}
          <div className="w-[80px] lg:w-[120px] h-1.5 bg-[#1e1e2e] rounded-sm overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${(animatedExp / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* Profile Avatar */}
        <div className="relative cursor-pointer">
          <img
            src={userData?.profileImage || defaultAvatar}
            alt="Profile"
            className="w-8 h-8 md:w-9 md:h-9 object-cover rounded-full border-2 border-[#161622]"
          />
        </div>
      </div>

    </div>
  );
};

export default GameHeader;
