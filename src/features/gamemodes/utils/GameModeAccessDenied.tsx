import React from "react";
import { useNavigate } from "react-router-dom";

interface GameModeAccessDeniedProps {
  errorMessage: string;
}

const GameModeAccessDenied: React.FC<GameModeAccessDeniedProps> = ({ errorMessage }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#06060a] text-center px-4 font-inter">
      <div className="bg-[#0d0d12] p-10 sm:p-12 rounded-2xl border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)] max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0" />
        
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-red-500 font-exo tracking-tight">
          [ ERROR: 403 ]
        </h2>
        <p className="text-xl font-medium mb-3 text-white">
          Access to Stage Denied
        </p>
        <p className="text-slate-400 mb-8 leading-relaxed">
          {errorMessage}
        </p>
        
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-semibold py-3.5 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95"
        >
          Return to Mission Log
        </button>
      </div>
    </div>
  );
};

export default GameModeAccessDenied;
