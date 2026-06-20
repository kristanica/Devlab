import React from "react";
import { motion } from "framer-motion";

interface InventoryVaultProps {
  inventory: any[];

}

const InventoryVault: React.FC<InventoryVaultProps> = ({ inventory }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full lg:w-[35%] flex flex-col gap-4"
    >
      <h3 className="text-white font-exo text-xl font-bold tracking-tight px-1">
        Inventory Vault
      </h3>

      <div className="flex-1 bg-[#0d0d12] border border-[#2a2a3c] rounded-xl p-5 flex flex-col min-h-[300px]">
        <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-2 scrollbar-custom">
          {inventory && inventory.length > 0 ? (
            inventory.map((item: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                key={item.id}
                className="group relative overflow-hidden border border-[#2a2a3c] rounded-lg bg-[#161622] hover:bg-[#1e1e2e] transition-colors flex items-center p-3 gap-4"
              >
                <div className="w-12 h-12 rounded-md bg-[#0d0d12] border border-[#2a2a3c] flex items-center justify-center shrink-0">
                  <img
                    src={`/ItemsIcon/${item.Icon}`}
                    alt={item.title}
                    className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-fuchsia-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500">Consumable Item</p>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-[#0d0d12] border border-[#2a2a3c] text-indigo-300 font-mono text-sm font-bold">
                  x{item.quantity}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#161622] flex items-center justify-center mb-1">
                <span className="text-xl opacity-50">🎒</span>
              </div>
              <p className="text-slate-400 font-medium text-sm">
                Your vault is empty
              </p>
              <p className="text-slate-600 text-xs">
                Complete missions or visit the shop to acquire items.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryVault;
