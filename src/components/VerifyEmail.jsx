import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { toast } from "react-toastify";

export default function VerifyEmail({ oobCode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        // Check if the code is valid and get the email
        const info = await checkActionCode(auth, oobCode);
        setEmail(info.data.email);

        // Apply the action to verify the email
        await applyActionCode(auth, oobCode);
        setVerified(true);

        toast.success("Email verified successfully!", {
          position: "bottom-center",
          theme: "colored",
        });

        // Redirect to login after 1 second
        setTimeout(() => navigate("/login"), 1000);
      } catch (err) {
        console.error(err);
        toast.error("Invalid or expired verification link.", {
          position: "bottom-center",
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [oobCode, navigate]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0D1117] p-4">
      <motion.div
        className="w-full max-w-md bg-gradient-to-b from-cyan-400 to-purple-500 rounded-2xl p-[2px] shadow-lg text-white"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="bg-[#1E212F] rounded-2xl p-6 relative">
          <h2 className="text-xl font-bold mb-4 text-center">Email Verification</h2>

          {loading ? (
            <p className="text-center text-gray-300">Verifying your email...</p>
          ) : verified ? (
            <>
              <p className="text-center text-green-400 mb-2 font-semibold">
                Your email has been verified!
              </p>
              <p className="text-center text-gray-300">
                Redirecting you to login...
              </p>
            </>
          ) : (
            <p className="text-center text-red-400">
              Verification link is invalid or expired.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
