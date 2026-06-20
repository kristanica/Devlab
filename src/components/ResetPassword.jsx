import { motion } from "framer-motion";
import { useState } from "react";
import { auth } from "../Firebase/Firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { toast } from "react-toastify";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { validatePassword } from "./Custom Hooks/validations";

export default function ResetPassword({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);


  const handleResetPassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields.", { position: "top-center", theme: "colored" });
      return;
    }

    const [status, msg] = validatePassword(newPassword);
    if (status === "error") {
      toast.error(msg, { position: "top-center", theme: "colored" });
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      toast.error("No authenticated user found.", { position: "top-center", theme: "colored" });
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast.success("Password has been reset!", { position: "top-center", theme: "colored" });
      onClose();
    } catch (error) {
      console.error(error);
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/invalid-credential") message = "Current password is incorrect.";
      toast.error(message, { position: "top-center", theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex justify-center items-center">
      <motion.div
        className="relative bg-gradient-to-b from-cyan-400 to-purple-500 rounded-2xl shadow-lg p-[2px] w-[90%] max-w-md text-white"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="bg-[#1E212F] rounded-2xl p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-white hover:text-gray-300 text-lg"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
          <p className="text-sm mb-4 text-center text-gray-300">
            Enter your current password and a new password.
          </p>

          {/* Current Password */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 pr-10 rounded-md bg-[#2C2F3F] text-white outline-none border border-gray-600 focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white text-xl hover:text-cyan-400"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          {/* New Password with Hover Tooltip */}
          <div className="relative mb-4 flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 pr-10 rounded-md bg-[#2C2F3F] text-white outline-none border border-gray-600 focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-10 -translate-y-1/2 text-white text-xl hover:text-cyan-400"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>

<div className="relative ml-2">
  {/* Info Icon */}
  <span
    onClick={() => setShowTooltip(!showTooltip)}
    className="text-gray-300 text-lg cursor-pointer">
  ℹ️
  </span>

  {/* Tooltip */}
  {showTooltip && (
    <div className="absolute right-0 top-6 
                    bg-[#1E212F] text-white text-xs p-3 rounded-md w-56
                    border border-gray-700 shadow-lg z-20 leading-tight">
      <p className="font-semibold mb-1 text-cyan-300">Password must contain:</p>
      • At least 8 characters<br />
      • One uppercase letter (A–Z)<br />
      • One lowercase letter (a–z)<br />
      • One number (0–9)<br />
      • One special character (!@#$...)
    </div>
  )}
</div>

          </div>

          {/* Reset Password Button */}
          <button
            disabled={loading}
            onClick={handleResetPassword}
            className={`w-full py-2 rounded-md font-bold transition ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#7F5AF0] hover:bg-[#6A4CD4]"
            }`}
          >
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
