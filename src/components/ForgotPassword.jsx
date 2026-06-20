import { motion } from "framer-motion";
import { useState } from "react";
// Firebase
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
// Ui
import { toast } from "react-toastify";

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

const handleForgotPassword = async () => {
  if (!email) {
    toast.error("Please enter your email address.", {
      position: "bottom-center",
      theme: "colored",
    });
    return;
  }

  setLoading(true);

  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`, // this must match your App route
      handleCodeInApp: true,
    };
console.log(actionCodeSettings);
    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    toast.success("Password reset email sent successfully!", {
      position: "bottom-center",
      theme: "colored",
    });
    onClose(); // close modal after success
  } catch (error) {
    console.error(error);
    let message = "Something went wrong. Please try again.";
    if (error.code === "auth/user-not-found") {
      message = "No account found with that email.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email format.";
    }
    toast.error(message, {
      position: "bottom-center",
      theme: "colored",
    });
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
        exit={{ scale: 0.8, opacity: 0 }}> 
        <div className="bg-[#1E212F] rounded-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-white hover:text-gray-300 text-lg cursor-pointer">
            ✕
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">
            Forgot Password
          </h2>
          <p className="text-sm mb-4 text-center text-gray-300">
            Enter your email to receive a password reset link.
          </p>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-md bg-[#2C2F3F] text-white outline-none mb-4 border border-gray-600 focus:border-cyan-400"/>
          <button
            disabled={loading}
            onClick={handleForgotPassword}
            className={`w-full py-2 rounded-md font-bold transition cursor-pointer ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#7F5AF0] hover:bg-[#6A4CD4]"
            }`}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;