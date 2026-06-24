import { motion, AnimatePresence, Variants } from "framer-motion";
import { IoPerson, IoLockOpen, IoEye, IoEyeOff, IoMail } from "react-icons/io5";
import { useAuthLogic } from "./useAuthLogic";

interface RegisterFormProps {
  formVariants: Variants;
  authLogic: ReturnType<typeof useAuthLogic>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ formVariants, authLogic }) => {
  const {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    showTooltip, setShowTooltip,
    setIsLoginMode, loading, handleRegister
  } = authLogic;

  return (
    <motion.div
      key="register"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-white font-exo tracking-tight mb-2">
          Create account
        </h2>
        <p className="text-slate-400 font-light tracking-wide text-sm">
          Join DevLab and start your coding journey.
        </p>
      </div>

      <form className="w-full flex flex-col gap-4" onSubmit={handleRegister} autoComplete="off">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoPerson className="text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Username"
            required
            className="w-full h-12 bg-[#13131f] text-white placeholder-slate-500 rounded-xl pl-11 pr-4 border border-[#2a2a3c] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoMail className="text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email address"
            required
            className="w-full h-12 bg-[#13131f] text-white placeholder-slate-500 rounded-xl pl-11 pr-4 border border-[#2a2a3c] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
          />
        </div>

        <div className="relative group flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IoLockOpen className="text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full h-12 bg-[#13131f] text-white placeholder-slate-500 rounded-xl pl-11 pr-12 border border-[#2a2a3c] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>
          
          <div className="relative">
            <span
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-slate-400 text-xl cursor-pointer hover:text-white transition-colors"
            >
              ℹ️
            </span>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 top-8 bg-[#1e1e2e] text-slate-300 text-xs p-4 rounded-xl w-56 border border-[#2a2a3c] shadow-2xl z-30 leading-relaxed"
                >
                  <p className="font-semibold text-purple-400 mb-2">Password must contain:</p>
                  <ul className="space-y-1 pl-1">
                    <li>• At least 8 characters</li>
                    <li>• One uppercase letter</li>
                    <li>• One lowercase letter</li>
                    <li>• One number</li>
                    <li>• One special character</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoLockOpen className="text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            required
            className="w-full h-12 bg-[#13131f] text-white placeholder-slate-500 rounded-xl pl-11 pr-12 border border-[#2a2a3c] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
          >
            {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-8 text-center sm:text-left">
        <p className="text-slate-400 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => setIsLoginMode(true)}
            className="font-medium text-white hover:text-purple-400 transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
