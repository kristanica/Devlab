
import Lottie from "lottie-react";
import loadingAnimation from "../assets/Lottie/loadingSmall.json"
import { useGameStore } from "./OpenAI Prompts/useBugBustStore";

export default function FullscreenLoader() {
  const { loading } = useGameStore();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center">
        <Lottie
          animationData={loadingAnimation}
          loop
          className="w-48 h-48"
        />
        <p className="mt-4 text-white text-lg font-medium animate-pulse">
          Devlab is thinking...
        </p>
      </div>
    </div>
  );
}
