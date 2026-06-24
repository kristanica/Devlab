import React from "react";
import LandingAmbientLights from "../features/landing/components/LandingAmbientLights";
import LandingHeader from "../features/landing/components/LandingHeader";
import LandingHeroCopy from "../features/landing/components/LandingHeroCopy";
import LandingInteractiveUI from "../features/landing/components/LandingInteractiveUI";

const LandingPage: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-[#06060a] overflow-hidden flex flex-col font-inter selection:bg-purple-500/30">
      <LandingAmbientLights />
      <LandingHeader />

      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full flex-1 px-6 sm:px-12 lg:px-20 gap-12 lg:gap-16 max-w-[1800px] mx-auto py-12 lg:py-0">
        <LandingHeroCopy />
        <LandingInteractiveUI />
      </main>
    </div>
  );
};

export default LandingPage;
