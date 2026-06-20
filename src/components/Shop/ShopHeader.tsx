import React from "react";
import { motion } from "framer-motion";
import MoneyIcon from "../../assets/Images/DevCoins.png";

interface ShopHeaderProps {
  animatedValue: number;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ animatedValue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="shrink-0 relative w-full rounded-xl overflow-hidden border border-[#2a2a3c] bg-[#0d0d12] shadow-xl p-6 lg:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-between"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 w-full md:w-2/3 flex flex-col gap-3 text-center md:text-left">
        <div className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest w-max mx-auto md:mx-0">
          Black Market
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-exo tracking-tight">
          DevShop
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Welcome to the DevLab Shop, where learning meets gamification! Earn DevCoins as you code, learn, and conquer challenges, then trade them for powerful upgrades to enhance your arsenal.
        </p>
      </div>

      <div className="relative z-10 shrink-0 flex items-center justify-center gap-4 bg-[#161622] border border-[#2a2a3c] py-3 px-5 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.1)]">
        <img src={MoneyIcon} alt="Coins" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
        <div className="flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Balance</span>
          <p className="font-exo font-bold text-yellow-400 text-2xl sm:text-3xl tracking-tight leading-none">
            {animatedValue}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopHeader;
