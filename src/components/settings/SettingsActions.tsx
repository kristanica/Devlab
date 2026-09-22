import React from "react";
import { motion } from "framer-motion";
import { FaKey, FaSignOutAlt } from "react-icons/fa";

interface SettingsActionsProps {
  setShowResetPass: (val: boolean) => void;
  setShowLogoutPopUp: (val: boolean) => void;
}

const SettingsActions: React.FC<SettingsActionsProps> = ({ setShowResetPass, setShowLogoutPopUp }) => {
  return (
    <div className="flex flex-col gap-6 lg:col-span-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-[#0d0d12] border border-[#2a2a3c] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col"
      >
        <h3 className="text-white font-exo text-lg font-bold tracking-tight mb-2">Security</h3>
        <p className="text-slate-500 text-sm mb-6">Update your password to keep your account secure.</p>
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setShowResetPass(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#161622] border border-[#2a2a3c] text-slate-300 font-bold py-3 px-6 rounded-lg hover:border-slate-500 hover:text-white transition-all uppercase tracking-wider text-sm"
        >
          <FaKey /> Reset Password
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-[#0d0d12] border border-[#2a2a3c] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col"
      >
        <h3 className="text-white font-exo text-lg font-bold tracking-tight mb-2">Danger Zone</h3>
        <p className="text-slate-500 text-sm mb-6">Terminate your current session securely.</p>
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutPopUp(true)}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-bold py-3 px-6 rounded-lg transition-all uppercase tracking-wider text-sm mt-auto"
        >
          <FaSignOutAlt /> Disconnect
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SettingsActions;
