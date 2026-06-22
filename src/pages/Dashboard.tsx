import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

// Icons and Assets
import { IoLogoHtml5, IoLogoCss3, IoLogoJavascript } from "react-icons/io5";
import { FaDatabase } from "react-icons/fa";

// Components
import Loading from "../components/Loading";
import ProfileCard from "../components/Dashboard/ProfileCard";
import SkillArsenal from "../components/Dashboard/SkillArsenal";
import RecentMissions from "../components/Dashboard/RecentMissions";
import InventoryVault from "../components/Dashboard/InventoryVault";

// Hooks
import useLevelBar from "@/hooks/useLevelBar";
import useSubjProgressBar from "@/hooks/useSubjProgressBar";
import useUserInventory from "@/hooks/useUserInventory";
import useFetchUserData from '@/services/api/useFetchUserData';

const Dashboard: React.FC = () => {
  const { userData, isLoading } = useFetchUserData();
  const { animatedExp } = useLevelBar();
  const { inventory, loading: inventoryLoading } = useUserInventory();

  const { animatedBar: htmlProgress } = useSubjProgressBar("Html");
  const { animatedBar: CssProgress } = useSubjProgressBar("Css");
  const { animatedBar: JsProgress } = useSubjProgressBar("JavaScript");
  const { animatedBar: DbProgress } = useSubjProgressBar("Database");

  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Initial Loading
  useEffect(() => {
    const hasLoadedBefore = sessionStorage.getItem("dashboardLoaded");

    if (hasLoadedBefore) {
      setLoadingDashboard(false);
      return;
    }

    if (!isLoading && !inventoryLoading) {
      const timer = setTimeout(() => {
        setLoadingDashboard(false);
        sessionStorage.setItem("dashboardLoaded", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, inventoryLoading]);

  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ["ShopItems"] });
  }, [queryClient]);

  if (loadingDashboard) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen z-50">
        <Loading />
      </div>
    );
  }

  const subjectIcons: Record<string, any> = {
    Html: IoLogoHtml5,
    Css: IoLogoCss3,
    JavaScript: IoLogoJavascript,
    Database: FaDatabase,
  };

  const progressData = [
    {
      name: "HTML",
      icon: IoLogoHtml5,
      value: htmlProgress,
      color: "from-orange-400 to-red-500",
      glow: "rgba(249,115,22,0.4)",
    },
    {
      name: "CSS",
      icon: IoLogoCss3,
      value: CssProgress,
      color: "from-cyan-400 to-blue-500",
      glow: "rgba(6,182,212,0.4)",
    },
    {
      name: "JavaScript",
      icon: IoLogoJavascript,
      value: JsProgress,
      color: "from-yellow-300 to-yellow-500",
      glow: "rgba(253,224,71,0.4)",
    },
    {
      name: "Database",
      icon: FaDatabase,
      value: DbProgress,
      color: "from-emerald-400 to-green-600",
      glow: "rgba(52,211,153,0.4)",
    },
  ];

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 bg-[#06060a] min-h-screen text-slate-200 selection:bg-purple-500/30 font-inter overflow-y-auto overflow-x-hidden">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mt-2"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-exo tracking-tight">
            Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back to DevLab. Your progress is synced.
          </p>
        </div>
      </motion.div>

      {/* Top Section: Profile + Subject Progress */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <ProfileCard userData={userData} animatedExp={animatedExp} />
        <SkillArsenal progressData={progressData} />
      </div>

      {/* Bottom Section: Jump Back In + Inventory */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 pb-10">
        <RecentMissions
          isLoading={isLoading}
          lastOpenedLevel={userData?.lastOpenedLevel}
          subjectIcons={subjectIcons}
        />
        <InventoryVault inventory={inventory} />
      </div>
    </div>
  );
};

export default Dashboard;
