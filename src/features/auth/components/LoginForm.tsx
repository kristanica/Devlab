import { motion, Variants } from "framer-motion";
import { IoLockOpen, IoEye, IoEyeOff, IoMail } from "react-icons/io5";
import { useAuthLogic } from "./useAuthLogic";

interface LoginFormProps {
  formVariants: Variants;
  authLogic: ReturnType<typeof useAuthLogic>;
}

const LoginForm: React.FC<LoginFormProps> = ({ formVariants, authLogic }) => {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    rememberMe, setRememberMe,
    setShowForgot, setIsLoginMode,
    loading, handleLogin
  } = authLogic;

  return (
    <motion.div
      key="login"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-white font-exo tracking-tight mb-2">
          Welcome back
        </h2>
        <p className="text-slate-400 font-light tracking-wide text-sm">
          Enter your credentials to access your account.
        </p>
      </div>

      <form className="w-full flex flex-col gap-5" onSubmit={handleLogin} autoComplete="off">
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
            className="w-full h-14 bg-[#13131f] text-white placeholder-slate-500 rounded-xl pl-11 pr-4 border border-[#2a2a3c] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IoLockOpen className="text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            className="w-full h-14 bg-[#13131f] text-white placeholder-slate-500 rounded-xl pl-11 pr-12 border border-[#2a2a3c] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 rounded border border-[#2a2a3c] bg-[#13131f] group-hover:border-purple-500 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer opacity-0 absolute inset-0 cursor-pointer"
              />
              <div className="opacity-0 peer-checked:opacity-100 absolute inset-0 bg-purple-500 rounded flex items-center justify-center transition-opacity">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center sm:text-left">
        <p className="text-slate-400 text-sm">
          Don't have an account?{' '}
          <button
            onClick={() => setIsLoginMode(false)}
            className="font-medium text-white hover:text-purple-400 transition-colors"
          >
            Create an account
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;
