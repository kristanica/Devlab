import React from "react";
import { AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";

import Loading from "../assets/Lottie/LoadingDots.json";
import ForgotPassword from "../components/ForgotPassword";

import { useAuthLogic } from "../components/Login/useAuthLogic";
import LoginForm from "../components/Login/LoginForm";
import RegisterForm from "../components/Login/RegisterForm";
import AuthInteractiveUI from "../components/Login/AuthInteractiveUI";

const Login: React.FC = () => {
  const authLogic = useAuthLogic();
  const { isLoginMode, loading, showForgot, setShowForgot } = authLogic;

  const formVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06060a]/90 backdrop-blur-sm">
          <Lottie animationData={Loading} loop className="w-64 h-64" />
        </div>
      )}

      <div className="flex min-h-screen bg-[#06060a] font-inter selection:bg-purple-500/30">
        
        {/* Left Side: Form (30%) */}
        <div className="w-full lg:w-[30%] min-w-[320px] max-w-xl lg:max-w-none mx-auto flex flex-col justify-center px-8 sm:px-12 py-10 bg-[#0b0b12] relative shadow-[20px_0_60px_rgba(0,0,0,0.6)] z-20 border-r border-[#1e1e2e]">
          <AnimatePresence mode="wait">
            {isLoginMode ? (
              <LoginForm formVariants={formVariants} authLogic={authLogic} />
            ) : (
              <RegisterForm formVariants={formVariants} authLogic={authLogic} />
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Interactive Coded Design (70%) */}
        <AuthInteractiveUI />
      </div>

      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
    </>
  );
};

export default Login;
