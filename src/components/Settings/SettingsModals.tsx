import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt } from "react-icons/fa";
import ResetPassword from "@/features/auth/components/ResetPassword";

interface SettingsModalsProps {
  isUploading: boolean;
  uploadProgress: number;
  showLogoutPopUp: boolean;
  setShowLogoutPopUp: (val: boolean) => void;
  logout: () => void;
  showResetPass: boolean;
  setShowResetPass: (val: boolean) => void;
}

const SettingsModals: React.FC<SettingsModalsProps> = ({
  isUploading,
  uploadProgress,
  showLogoutPopUp,
  setShowLogoutPopUp,
  logout,
  showResetPass,
  setShowResetPass,
}) => {
  return (
    <>
      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-[#0d0d12] border border-[#2a2a3c] p-8 rounded-2xl w-[90%] max-w-sm text-center shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <h2 className="text-white font-exo text-xl font-bold tracking-tight mb-6">
              Transmitting Data...
            </h2>
            <div className="w-full bg-[#161622] h-4 rounded-full overflow-hidden border border-[#2a2a3c] p-0.5">
              <div
                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-purple-400 font-mono mt-4 font-bold">
              {Math.round(uploadProgress)}%
            </p>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutPopUp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0d0d12] border border-[#2a2a3c] text-white p-8 rounded-2xl text-center shadow-[0_0_50px_rgba(239,68,68,0.15)] w-full max-w-sm flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-4">
                <FaSignOutAlt className="text-red-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold font-exo tracking-tight">
                Terminate Session?
              </h2>
              <p className="text-slate-400 mt-2 mb-8">
                Are you sure you want to disconnect from the DevLab mainframe?
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={logout}
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  Confirm Disconnect
                </button>
                <button
                  onClick={() => setShowLogoutPopUp(false)}
                  className="w-full bg-[#161622] border border-[#2a2a3c] text-slate-300 font-bold py-3 rounded-lg hover:border-slate-500 hover:text-white transition-colors uppercase tracking-wider text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      {showResetPass && (
        <ResetPassword onClose={() => setShowResetPass(false)} />
      )}
    </>
  );
};

export default SettingsModals;
