// Imports remain the same as your original code
import HtmlIcons from '../assets/navbarIcons/HTML.png';
import CssIcons from '../assets/navbarIcons/css.png';
import DataIcons from '../assets/navbarIcons/database.png';
import JsIcons from '../assets/navbarIcons/JavaScript.png';
import Coins from '../assets/Images/DevCoins.png';
import defaultAvatar from './../assets/Images/profile_handler.png';
import LoadingSmall from '../assets/Lottie/loadingSmall.json';
import Loading from './Loading';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Lottie from 'lottie-react';

import useLevelBar from './Custom Hooks/useLevelBar';
import useSubjProgressBar from './Custom Hooks/useSubjProgressBar';
import useUserInventory from './Custom Hooks/useUserInventory';
import useFetchUserData from './BackEnd_Data/useFetchUserData.jsx';
import { fetchShopItems } from './BackEnd_Data/useFethShopItems.jsx';

function Dashboard() {
  const icons = import.meta.glob('../assets/ItemsIcon/*', { eager: true });
  const { userData, isLoading } = useFetchUserData();
  const { animatedExp } = useLevelBar();
  const { inventory } = useUserInventory();
  const { animatedBar: htmlProgress } = useSubjProgressBar('Html');
  const { animatedBar: CssProgress } = useSubjProgressBar('Css');
  const { animatedBar: JsProgress } = useSubjProgressBar('JavaScript');
  const { animatedBar: DbProgress } = useSubjProgressBar('Database');

  const [loadingDashboard, setLoading] = useState(true);


// Intial Loading
useEffect(() => {
  const hasLoadedBefore = sessionStorage.getItem('dashboardLoaded');

  if (!hasLoadedBefore) {
    // First time in this session → show loader
    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('dashboardLoaded', 'true');
    }, 4000);

    return () => clearTimeout(timer);
  } else {
    // Already loaded before → skip loader
    setLoading(false);
  }
}, []);


  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.prefetchQuery(['ShopItems'], fetchShopItems);
  }, [queryClient]);

if (loadingDashboard) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-50">
      <Loading />
    </div>
  );
}

  const subjectIcons = {
    Html: HtmlIcons,
    Css: CssIcons,
    JavaScript: JsIcons,
    Database: DataIcons,
  };

  return (
    <div className="w-full h-[100%] p-4 flex flex-col gap-4">
      {/* Top Section: Profile + Subject Progress */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Profile Card */}
        <div
          className="shadow-black shadow-md w-full lg:w-[60%] min-h-[40%] rounded-4xl flex flex-col lg:flex-row items-center gap-5 p-2 bg-cover bg-center"
          style={{
            backgroundImage: `url(${userData?.backgroundImage})`,
            backgroundColor: '#111827',
          }}
        >
          <div className="w-full lg:w-[40%] h-full flex flex-col items-center gap-5 p-2">
            <div className="w-[70%] h-[80%] rounded-full overflow-hidden">
              <img
                src={userData?.profileImage || defaultAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white font-inter text-[0.8rem] break-words w-full rounded-2xl backdrop-blur-[10px] text-shadow-lg/60 text-center">
              <p>{userData?.bio}</p>
            </div>
          </div>

          <div className="h-auto w-full lg:w-[60%] flex flex-col p-2 gap-2">
            <p className="text-white font-inter font-bold text-shadow-lg/60">Good to see you!</p>
            <h1 className="sm:text-[1.5rem] md:text-[2.5rem] lg:text-[3.5rem] text-white font-inter font-bold break-words leading-tight text-shadow-lg/60">
              {userData?.username}
            </h1>
            <p className="text-white font-inter font-bold text-shadow-lg/60">
              Level {userData?.userLevel}
            </p>

            {/* XP Bar */}
            <div className="w-full h-4 mb-3 mt-3 bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                className="h-4 rounded-full dark:bg-[#2CB67D]"
                style={{ width: `${(animatedExp / 100) * 100}%` }}
              />
            </div>

            {/* Coins & XP */}
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <p className="text-white font-inter font-bold text-shadow-lg/60">
                User Xp: {userData?.exp} / 100
              </p>
              <div className="flex items-center gap-2 text-white font-inter font-bold text-shadow-lg/60">
                <img
                  src={Coins}
                  alt="Coins"
                  className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain"
                />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl truncate">
                  {userData?.coins}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="w-full lg:w-[40%] bg-[#111827] rounded-4xl p-5 flex flex-col justify-center gap-4 shadow-black shadow-md">
          <h2 className="text-white font-exo text-[1.5rem] font-bold text-center tracking-wide">Your Progress</h2>
          {[
            { name: 'Html', icon: HtmlIcons, value: htmlProgress, colors: 'from-yellow-400 to-orange-500' },
            { name: 'Css', icon: CssIcons, value: CssProgress, colors: 'from-cyan-400 to-blue-600' },
            { name: 'JavaScript', icon: JsIcons, value: JsProgress, colors: 'from-yellow-300 to-orange-500' },
            { name: 'Database', icon: DataIcons, value: DbProgress, colors: 'from-green-400 to-emerald-700' },
          ].map((subj) => (
            <div className="flex items-center gap-4" key={subj.name}>
              <img src={subj.icon} alt={subj.name} className="w-6 h-6" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-white font-exo text-sm sm:text-base">{subj.name} Development</span>
                  <span className="text-gray-400 font-exo text-sm">{Math.round(subj.value)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${subj.colors} transition-all duration-700 ease-in-out`}
                    style={{ width: `${subj.value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Jump Back In + Inventory */}
      <div className="flex flex-col lg:flex-row gap-2 lg:h-[55%] xl:h-[70%]">
        {/* Jump Back In */}
        <div className="flex-1 h-full w-full lg:w-[75%] p-1 flex flex-col gap-4 JumpBackInCont">
          <h2 className="text-white font-exo font-bold text-[1.5rem] text-shadow-lg/60">Jump Back In</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-[70%]">
              <Lottie animationData={LoadingSmall} loop className="w-[50%] h-[50%]" />
            </div>
          ) : userData?.lastOpenedLevel && Object.keys(userData.lastOpenedLevel).length > 0 ? (
            <div className="flex flex-col gap-3 overflow-auto p-2 scrollbar-custom lg:h-[80%]">
              {Object.entries(userData.lastOpenedLevel)
                .sort(([a], [b]) => ['Html', 'Css', 'JavaScript', 'Database'].indexOf(a) - ['Html', 'Css', 'JavaScript', 'Database'].indexOf(b))
                .map(([subject, info]) => (
                  <Link
                    key={subject}
                    to={`/Main/Lessons/${info.subject}/${info.lessonId}/${info.levelId}/${info.stageId}/${info.gameMode}`}
                    className="h-auto"
                  >
                    <div className="w-[100%] bg-[#111827] flex rounded-3xl border-black border-2 gap-4 hover:scale-101 cursor-pointer duration-300 min-h-[100px]">
                      <div className="min-w-[15%] rounded-3xl flex items-center justify-center p-2 bg-[#0B0F16] shadow-md">
                        <img
                          src={subjectIcons[subject]}
                          alt={subject}
                          className="w-10 h-10 sm:w-15 sm:h-15 object-contain"
                        />
                      </div>
                      <div className="p-2 flex-col flex gap-2">
                        <p className="font-exo text-[1.2rem] text-white font-bold">{info.title}</p>
                        <p className="font-exo text-gray-500 text-[0.7rem] line-clamp-2">{info.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="w-[100%] bg-[#111827] rounded-3xl border-black border-2 flex items-center justify-center p-5">
              <p className="text-gray-400 font-exo text-lg text-center">
                No recent levels yet. Start learning to unlock this tab!
              </p>
            </div>
          )}
        </div>

        {/* Inventory */}
<div className="bg-[#0B0F16] border border-gray-700/60 w-full lg:w-[25%] h-[88%] rounded-3xl p-3 flex flex-col mt-4 InventoryCont">
  <h1 className="text-white font-exo text-[2em] font-bold mb-4 text-center tracking-wide">Inventory</h1>
  <div className="overflow-y-auto overflow-x-hidden flex flex-col gap-4 scrollbar-custom">
    {inventory && inventory.length > 0 ? (
      inventory.map((item) => (
        <div
          key={item.id}
          className="group border border-gray-700/50 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0D1117] hover:from-[#1A2333] hover:to-[#121826] transition-all duration-300 flex items-center justify-between p-3 shadow-md hover:shadow-lg h-[90px] min-h-[90px] max-h-[90px]"
        >
          <div className="rounded-2xl bg-gray-800/70 p-2 flex justify-center items-center w-[70px] h-[70px] overflow-hidden shadow-inner">
            <img
              src={icons[`../assets/ItemsIcon/${item.Icon}`]?.default}
              alt={item.title}
              className="w-full h-full object-contain scale-90 group-hover:scale-100 transition-transform duration-300"
            />
          </div>
          <h2 className="text-base font-exo text-gray-200 flex-1 text-center px-3 leading-tight truncate">
            {item.title}
          </h2>
          <p className="rounded-xl bg-gray-800/60 px-3 py-2 text-sm font-exo text-white shadow-inner border border-gray-700/40 whitespace-nowrap">
            x{item.quantity}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-400 text-center text-lg font-exo mt-8">No Items</p>
    )}
  </div>
</div>

      </div>
    </div>
  );
}

export default Dashboard;
