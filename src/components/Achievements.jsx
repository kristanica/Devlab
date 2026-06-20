// UI
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Lottie from 'lottie-react';
// Assets
import Claim from '../assets/Lottie/ClaimAchievement.json'
import AchIcon from '../assets/Images/Achievemen-Icon.png'
import Loading from '../assets/Lottie/LoadingDots.json'
import defaultAvatar from './../assets/Images/profile_handler.png';
// Data
import useFetchUserData from "./BackEnd_Data/useFetchUserData.jsx";
import useUserAchievements from './Custom Hooks/useUserAchievements.jsx'
import useAchievementsProgressBar from './Custom Hooks/useAchievementProgressBar.jsx';
import useFetchAchievements from "./BackEnd_Data/useFetchAchievements.jsx";
// Utils
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react'  
import '../index.css'
// Firebase
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase/Firebase";

function Achievements() {
  const { userData } = useFetchUserData();
  const { achievements: HtmlData, isLoading: htmlLoading } = useFetchAchievements("Html");
  const { achievements: CssData, isLoading: cssLoading } = useFetchAchievements("Css");
  const { achievements: JsData, isLoading: jsLoading } = useFetchAchievements("JavaScript");
  const { achievements: DatabaseData, isLoading: dbLoading } = useFetchAchievements("Database");

  const { animatedBar:HtmlBar } = useAchievementsProgressBar(userData?.uid, "Html");
  const { animatedBar:CssBar } = useAchievementsProgressBar(userData?.uid, "Css");
  const { animatedBar:JsBar } = useAchievementsProgressBar(userData?.uid, "JavaScript");
  const { animatedBar:DatabaseBar } = useAchievementsProgressBar(userData?.uid, "Database");

  const { data: userAchievements } = useUserAchievements(userData?.uid);

  const [LoadingClaim, setLoadingClaim] = useState(false);
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async (achievement) => {
      const userId = userData.uid;
      const userRef = doc(db, "Users", userId);
      const userAchRef = doc(db, "Users", userId, "Achievements", achievement.id);

      await updateDoc(userAchRef, { isClaimed: true });

      let newExp = (userData.exp || 0) + (achievement.expReward || 0);
      let newLevel = userData.userLevel || 1;
      let newCoins = (userData.coins || 0) + (achievement.coinsReward || 0);

      if (newExp >= 100) {
        const levelsGained = Math.floor(newExp / 100);
        newLevel += levelsGained;
        newExp = newExp % 100;
      }

      await updateDoc(userRef, {
        exp: newExp,
        userLevel: newLevel,
        coins: newCoins,
      });

      return achievement.id;
    },
    onMutate: async (achievement) => {
      const claimedItem =
        HtmlData.find(a => a.id === achievement.id) ||
        CssData.find(a => a.id === achievement.id) ||
        JsData.find(a => a.id === achievement.id) ||
        DatabaseData.find(a => a.id === achievement.id);

      if (claimedItem) showClaimToast(claimedItem);

      queryClient.setQueryData(["userAchievements", userData.uid], (oldData) => ({
        ...oldData,
        [achievement.id]: { ...oldData?.[achievement.id], isClaimed: true },
      }));

      queryClient.setQueryData(["User_Details", userData.uid], (oldData) => ({
        ...oldData,
        exp: (oldData?.exp || 0) + (achievement.expReward || 0),
        userLevel:
          (oldData?.userLevel || 1) +
          Math.floor(((oldData?.exp || 0) + (achievement.expReward || 0)) / 100),
        coins: (oldData?.coins || 0) + (achievement.coinsReward || 0),
      }));
    },
    onError: () => {
      queryClient.invalidateQueries(["userAchievements", userData.uid]);
      queryClient.invalidateQueries(["User_Details", userData.uid]);
    },
  });

  const handleClaim = (item) => {
    claimMutation.mutate(item, {
      onSuccess: () => setLoadingClaim(false),
      onError: () => setLoadingClaim(false),
    });
  };

  const showClaimToast = (item) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-white rounded-2xl shadow-2xl px-6 py-4 flex flex-col sm:flex-row items-center gap-4 text-center max-w-sm w-full mx-auto">
          <Lottie animationData={Claim} loop={false} autoplay style={{ width: 50, height: 50 }} />
          <div className="flex flex-col">
            <h1 className="font-exo text-green-700 font-extrabold text-2xl drop-shadow-sm">
              🎉 Congratulations!
            </h1>
            <p className="text-gray-700 text-base">
              You claimed <span className="font-bold text-purple-700">{item.title}</span> reward!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <div className="bg-yellow-100 px-3 py-1 rounded-xl shadow-sm">
                <p className="text-sm text-yellow-700 font-bold">
                  DevCoins: <span className="text-yellow-600">+{item.coinsReward}</span>
                </p>
              </div>
              <div className="bg-cyan-100 px-3 py-1 rounded-xl shadow-sm">
                <p className="text-sm text-cyan-700 font-bold">
                  Exp: <span className="text-cyan-600">+{item.expReward}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ),
      { duration: 3000, position: "top-center" }
    );
  };

  const renderAchievementSection = (title, data, loading) => (
    <>
      <h1 className={`text-4xl sm:text-5xl font-exo font-bold text-shadow-lg/30 mb-6`} 
          style={{color: title.includes('HTML') ? '#FF5733' : title.includes('CSS') ? '#1E90FF' : title.includes('JAVASCRIPT') ? '#F7DF1E' : '#4CAF50'}}>
        {title}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {loading ? (
          <div className="col-span-full flex justify-center items-center">
            <Lottie animationData={Loading} loop={true} className="w-[40%] sm:w-[20%]" />
          </div>
        ) : (
          data?.map((item) => {
            const isUnlocked = !!userAchievements?.[item.id];
            const isClaimed = isUnlocked && userAchievements[item.id]?.isClaimed;
            return (
              <div
                key={item.id}
                className={`p-[2px] rounded-xl bg-gradient-to-b from-cyan-400 to-purple-500 transition duration-500
                  hover:scale-105 hover:shadow-lg hover:shadow-gray-400
                  ${isUnlocked ? "opacity-100" : "opacity-40 cursor-not-allowed hover:shadow-none"}`}>
                <div className="bg-[#0F172A] rounded-xl p-4 flex flex-col items-center text-center space-y-4 h-full">
                  <img src={AchIcon} alt="Achievements Icon" className="w-20 h-20" />
                  <hr className="border-t border-gray-700 w-full" />
                  <h3 className="text-white text-lg font-bold">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                  <button
                    onClick={() => isUnlocked && !isClaimed && handleClaim(item)}
                    className={`px-4 py-1 rounded-full font-semibold cursor-pointer
                      ${isClaimed ? "bg-green-500 text-white" : isUnlocked ? "bg-yellow-500 text-black" : "bg-red-500 text-white"}`}>
                    {isClaimed ? "COMPLETED" : isUnlocked ? "UNCLAIMED" : "LOCKED"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Profile Header */}
      <div className='w-full rounded-3xl flex flex-col p-3 '
style={{
  backgroundImage: `url(${userData?.backgroundImage})`,
  backgroundColor: '#111827',
  backgroundSize: 'cover',   
  backgroundPosition: 'center',  
}}
>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden'>
            <img src={userData?.profileImage || defaultAvatar} alt="Profile" className="w-full h-full object-cover"/>
          </div>
          <p className='font-exo font-bold text-white text-shadow-lg/30'>{userData?.username}</p>
          <p className='font-exo font-bold text-white tracking-wider text-shadow-lg/30 text-2xl sm:text-3xl'>HALL OF ACHIEVEMENTS</p>
        </div>
        <div className='flex flex-wrap justify-around gap-4 mt-4'>
          {[
            {label: 'HTML', bar: HtmlBar},
            {label: 'CSS', bar: CssBar},
            {label: 'JAVASCRIPT', bar: JsBar},
            {label: 'DATABASE', bar: DatabaseBar},
          ].map((item) => (
            <div key={item.label} className='w-[45%] sm:w-[30%] md:w-[20%] p-2 backdrop-blur-md rounded-xl flex flex-col items-center'>
              <span className="text-white font-exo font-bold text-center text-sm sm:text-base">{item.label}</span>
              <div className="w-full h-4 mt-2 bg-gray-200 rounded-full">
                <div className="h-4 rounded-full bg-[#2CB67D]" style={{ width: `${item.bar}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Sections */}
      <div className='mt-2 sm:h-auto lg:h-[54%] xl:h-[57%] overflow-y-scroll scrollbar-custom p-5 '>
        <div className='flex flex-col items-center gap-10'>
          {renderAchievementSection("HTML ACHIEVEMENTS", HtmlData, htmlLoading)}
          {renderAchievementSection("CSS ACHIEVEMENTS", CssData, cssLoading)}
          {renderAchievementSection("JAVASCRIPT ACHIEVEMENTS", JsData, jsLoading)}
          {renderAchievementSection("DATA QUERYING ACHIEVEMENTS", DatabaseData, dbLoading)}
        </div>
      </div>

      {/* Loading Overlay */}
      {LoadingClaim && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/85'>
          <Lottie animationData={Loading} loop={true} className="w-1/2 sm:w-1/4" /> 
        </div>
      )}
    </>
  );
}

export default Achievements;
