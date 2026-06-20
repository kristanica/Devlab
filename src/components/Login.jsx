

import Image from "../assets/Images/Login-Image.jpg";
import Loading from "../assets/Lottie/LoadingDots.json";
// Utils
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Firebase
import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../Firebase/Firebase";
// UI
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import { IoPerson, IoLockOpen, IoEye, IoEyeOff } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
// Components
import ForgotPassword from "./ForgotPassword";
import { onAuthStateChanged } from "firebase/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await user.reload();

      if (!user.emailVerified) {
        await signOut(auth);
        toast.error("Your email has not been verified yet.", {
          position: "top-center",
          theme: "colored",
        });
        setLoading(false);
        return;
      }

      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().isSuspend) {
        await signOut(auth);
        toast.error("Your account has been suspended.", {
          position: "top-center",
          theme: "colored",
        });
        setLoading(false);
        return;
      }

toast.success("Login successful!", {
  position: "top-center",
  theme: "colored",
});

// Get custom claims (role)
const tokenResult = await user.getIdTokenResult(true);
const role = tokenResult.claims.role;

//  Admin vs User redirect
if (role === "admin") {
  navigate("/Admin", { replace: true });
} else {
  navigate("/Main", { replace: true });
}


    } catch (error) {
  const errorMap = {
    "auth/invalid-credential":"Invalid User Credentials",
    "auth/user-not-found": "No account found with this email.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/user-disabled": "Your account has been suspended.",
  };

  const message = errorMap[error.code] || "Login failed. Please try again.";

  toast.error(message, {
    position: "top-center",
    theme: "colored",
  });
    } finally {
      setLoading(false);
    }
  };

  


  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <Lottie animationData={Loading} loop className="w-1/2 h-1/2" />
        </div>
      )}

      <div className="min-h-screen bg-[#0D1117] flex justify-center items-center px-4 py-8">
        {/* Wrapper */}
        <div className="w-full max-w-5xl bg-[#25293B] rounded-3xl shadow-lg shadow-cyan-500 flex flex-col sm:flex-row overflow-hidden">
          {/* Left Image */}
          <div
            className="hidden sm:flex w-1/2 bg-cover bg-center p-4 items-center justify-center"
            style={{ backgroundImage: `url(${Image})` }}
          >
            <h1 className="font-exo text-4xl lg:text-5xl font-bold text-[#F5F5F5] drop-shadow-xl ">
              DEVLAB
            </h1>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col items-center w-full sm:w-1/2 p-6">
            <FaUserCircle className="text-[#314A70] text-[7rem] mb-10" />
            <form
              className="w-full flex flex-col items-center gap-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              {/* Email */}
              <div className="w-[85%] relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="bg-[#1E212F] text-white w-full h-12 rounded-2xl pl-12 pr-4 border-2 border-gray-700 focus:border-cyan-500 focus:outline-none"
                />
                <IoPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white" />
              </div>

              {/* Password */}
              <div className="w-[85%] relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="bg-[#1E212F] text-white w-full h-12 rounded-2xl pl-12 pr-12 border-2 border-gray-700 focus:border-cyan-500 focus:outline-none"
                />
                <IoLockOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white" />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-xl hover:text-cyan-400"
                >
                  {showPassword ? <IoEyeOff /> : <IoEye />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-white text-sm hover:underline cursor-pointer">
                Forgot Password
              </button>

                <div className="m-[2%]">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  className="peer cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-white pl-2 cursor-pointer transition-all duration-300 peer-checked:text-green-400 hover:drop-shadow-[0_0_6px_rgba(147,197,253,0.8)]"
                >
                  Remember Me
                </label>
              </div>

              {/* Login Button */}
              <div className="w-[60%] mt-4">
                <button
                  type="submit"
                  className="bg-[#7F5AF0] w-full text-lg rounded-3xl text-white p-3 font-bold hover:bg-[#6A4CD4] hover:scale-105 transition-all duration-300 drop-shadow-xl cursor-pointer">
                  Login
                </button>
              </div>
            </form>

            <div className="text-white text-center mt-4">
              <p>
                Don't have an account?{' '}
                <Link
                  to="/Register"
                  className="text-blue-300 hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
    </>
  );
}

export default Login;
