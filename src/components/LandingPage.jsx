import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import { LandingPage_Data } from "../Data/LandingContents_Data";

function LandingPage() {
  const [currentDisplay, setCurrentDisplay] = useState(0);
  const [visible, setVisible] = useState(true);
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);



  // Fade-out transition
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timeout);
  }, [currentDisplay]);

  // Fade-in new data
  useEffect(() => {
    if (!visible) {
      const fadeIn = setTimeout(() => {
        setCurrentDisplay((prev) => (prev + 1) % LandingPage_Data.length);
        setVisible(true);
      }, 1000);
      return () => clearTimeout(fadeIn);
    }
  }, [visible]);

  // Entrance animation
  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const currentItem = LandingPage_Data[currentDisplay];

  return (
    <div className="w-full min-h-screen bg-[radial-gradient(circle_at_center,_#9333EA_0%,_#1E1E2E_65%,_#0F0F17_100%)] overflow-hidden p-5 flex flex-col">
      {/* Header */}
      <div className="h-[8%] font-exo flex items-center justify-between px-5 sm:px-10 lg:px-20">
        <h1 className="text-3xl sm:text-4xl text-white font-bold">DevLab</h1>
          <Link to="/Login">
            <button className="relative h-10 sm:h-12 w-32 sm:w-40 overflow-hidden border border-indigo-600 text-indigo-600 shadow-2xl transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:h-0 before:w-0 before:rounded-sm before:bg-indigo-600 before:duration-300 before:ease-out hover:text-white hover:shadow-indigo-600 hover:before:h-40 hover:before:w-40 hover:before:opacity-80 hover:cursor-pointer">
              <span className="relative z-10 text-sm sm:text-base">
                Get Started
              </span>
            </button>
          </Link>
        
      </div>

      {/* Contents */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full flex-1 gap-8 sm:gap-12 mt-6 sm:mt-10">
        {/* Left Text Panel */}
        <div
          className={`w-full lg:w-[45%] text-white font-exo flex flex-col items-center justify-center gap-5 text-center lg:text-left px-4 sm:px-10 transition-all duration-1000 ease-out ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
          <p className="text-2xl sm:text-3xl">Welcome to</p>
          <h1 className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] lg:text-[8rem] font-bold text-[#dabaf7] leading-none">
            DevLab
          </h1>
          <p className="text-xl sm:text-2xl">
            "<span className="text-purple-200">Code.</span>{" "}
            <span className="text-purple-300">Play.</span>{" "}
            <span className="text-purple-400">Level Up.</span>"
          </p>
          <div className="max-w-[500px] text-sm sm:text-base">
            <p>
              DevLab helps you learn full-stack web development through fun,
              interactive challenges. Build your skills, level up, and get
              smarter with AI-powered guidance.
            </p>
          </div>
        </div>

        {/* Right Animation Panel */}
        <div
          className={`flex flex-col items-center justify-center w-full lg:w-[55%] transition-all duration-1000 ease-out ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
          <div
            key={currentDisplay}
            className={`flex flex-col items-center text-white gap-4 sm:gap-6 transition-opacity duration-1000 ease-in-out ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center justify-center w-[70%] sm:w-[50%] lg:w-[40%] max-w-[300px]">
              {currentItem.icon}
            </div>
            <h1 className="font-exo text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center">
              {currentItem.header}
            </h1>
            <h2 className="font-exo text-lg sm:text-xl md:text-2xl text-center">
              {currentItem.header2}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-center px-3 sm:px-8 max-w-[600px]">
              {currentItem.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
