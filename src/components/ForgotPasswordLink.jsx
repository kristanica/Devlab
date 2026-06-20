import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// Firebase
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
// Utils
import { validatePassword } from "./Custom Hooks/validations";
// UI
import { toast } from "react-toastify";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function ResetPassword({ oobCode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);


  // Toggle states for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      toast.error("Reset code missing or invalid.");
      return;
    }
    const verify = async () => {
      try {
        const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(verifiedEmail);
        setVerified(true);
      } catch (err) {
        console.error(err);
        toast.error("Invalid or expired password reset link.", { position: "top-right" });
      }
    };

    verify();
  }, []);

  const handleSubmit = async () => {
    if (loading) return;
    if (!verified) {
      toast.error("Unable to verify reset request.");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const [status, message] = validatePassword(newPassword);
    if (status === "error") {
      toast.error(message, { position: "top-right" });
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Password updated successfully! You can now sign in.", { position: "bottom-center" });
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password. The link may be expired.", { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0D1117]">
      <motion.div
        className="w-full max-w-md bg-gradient-to-b from-cyan-400 to-purple-500 rounded-2xl p-[2px] shadow-lg text-white"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="bg-[#1E212F] rounded-2xl p-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 right-4 text-white hover:text-gray-300 text-lg cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
          <p className="text-sm mb-4 text-center text-gray-300">
            {verified ? `Resetting password for ${email}` : "Verifying reset link..."}
          </p>

          {/* New Password */}
          <div className="relative mb-3">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 rounded-md bg-[#2C2F3F] text-white outline-none border border-gray-600 focus:border-cyan-400"
              disabled={!verified || loading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xl hover:text-cyan-400"
            >
              {showNewPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 rounded-md bg-[#2C2F3F] text-white outline-none border border-gray-600 focus:border-cyan-400"
              disabled={!verified || loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xl hover:text-cyan-400"
            >
              {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !verified}
            className={`w-full py-2 rounded-md font-bold transition ${
              loading || !verified ? "bg-gray-500 cursor-not-allowed" : "bg-[#7F5AF0] hover:bg-[#6A4CD4]"
            }`}
          >
            {loading ? "Saving..." : "Save new password"}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Password must be at least 8 characters and contain upper & lower case letters, a number, and a special character.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
