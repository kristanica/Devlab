import React from "react";
import { motion } from "framer-motion";
import MoneyIcon from "../../assets/Images/DevCoins.png";

interface ShopItemGridProps {
  shopItems: any[];
  isLoading: boolean;
  onBuy: (item: any) => void;
}

const ShopItemGrid: React.FC<ShopItemGridProps> = ({ shopItems, isLoading, onBuy }) => {
  return (
    <div className="flex-1 w-full flex flex-col gap-4 min-h-0">
      <h2 className="text-white font-exo text-2xl font-bold tracking-tight px-1">Available Items</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#0d0d12] border border-[#1e1e2e] rounded-xl h-[340px] animate-pulse flex flex-col p-6 gap-4">
              <div className="w-24 h-24 bg-[#161622] rounded-xl self-center mb-2" />
              <div className="h-5 bg-[#161622] rounded w-3/4 self-center" />
              <div className="h-3 bg-[#161622] rounded w-full mt-2" />
              <div className="h-3 bg-[#161622] rounded w-5/6 self-center" />
              <div className="mt-auto h-12 bg-[#161622] rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-10">
          {shopItems?.map((item: any) => (
            <div
              key={item.id}
              className="group relative overflow-hidden bg-[#0d0d12] border border-[#2a2a3c] hover:border-purple-500/50 hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)] transition-all duration-300 rounded-xl p-6 flex flex-col text-center h-full"
            >
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-purple-500/20 blur-[40px] rounded-full pointer-events-none group-hover:bg-purple-500/40 transition-colors" />

              <div className="relative z-10 w-24 h-24 mx-auto mb-6 flex items-center justify-center shrink-0">
                <img 
                  src={`/ItemsIcon/${item.Icon}`} 
                  alt={item.title} 
                  className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300" 
                />
              </div>

              <h3 className="relative z-10 text-xl font-bold text-white font-exo tracking-tight mb-2">
                {item.title}
              </h3>
              <p className="relative z-10 text-sm text-slate-400 flex-1 line-clamp-3 mb-6">
                {item.desc}
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onBuy(item)}
                className="relative z-10 w-full py-3 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                Buy for {item.cost}
                <img src={MoneyIcon} alt="Coins" className="w-4 h-4 object-contain ml-1" />
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopItemGrid;
