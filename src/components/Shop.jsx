import { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";

import MoneyIcon from '../assets/Images/DevCoins.png';
import Loading from '../assets/Lottie/LoadingDots.json';
import Lottie from 'lottie-react';
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import useFetchUserData from './BackEnd_Data/useFetchUserData';
import useAnimatedNumber from './Custom Hooks/useAnimatedNumber';
import useFetchShopItems from './BackEnd_Data/useFethShopItems';
import { purchaseItem } from './BackEnd_Functions/purchaseItem';
import { playSound } from './Custom Hooks/DevlabSoundHandler';

import '../index.css';

function Shop() {
  const { shopItems, isLoading } = useFetchShopItems();
  const icons = import.meta.glob('../assets/ItemsIcon/*', { eager: true });

  const { userData } = useFetchUserData();
  const { animatedValue } = useAnimatedNumber(userData?.coins);

  const [isBuying, setIsBuying] = useState(false);
  const queryClient = useQueryClient();

  const buyMutation = useMutation({
    mutationFn: async (item) => purchaseItem(item.id, item.cost, item.Icon),
    onMutate: async (item) => {
      playSound("purchase"); 
      await queryClient.cancelQueries(["userData"]);
      const previousUserData = queryClient.getQueryData(["userData"]) || userData;
      if (!previousUserData || previousUserData.coins < item.cost) {
        toast.error("Not enough DevCoins!", { position: "top-center", theme: "colored" });
        throw new Error("Insufficient coins");
      }
      queryClient.setQueryData(["userData"], (oldData) => ({
        ...oldData,
        coins: (oldData?.coins || 0) - item.cost,
      }));
      showPurchaseToast(item);
      return { previousUserData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userData", userData.uid]);
      queryClient.invalidateQueries(["shopItems"]);
      setIsBuying(false);
    },
    onError: (context) => {
      if (context?.previousUserData) {
        queryClient.setQueryData(["userData", userData.uid], context.previousUserData);
      }
      toast.error("Purchase failed. Try again!", { position: "top-center", theme: "colored" });
      setIsBuying(false);
    },
  });

  const showPurchaseToast = (item) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-white rounded-2xl shadow-2xl px-6 py-4 flex flex-col sm:flex-row items-center gap-4 text-center max-w-sm w-full mx-auto"
        >
          <div className="flex flex-col">
            <h1 className="font-exo text-green-700 font-extrabold text-2xl drop-shadow-sm">
              🛒 Purchase Successful!
            </h1>
            <p className="text-gray-700 text-base">
              You bought <span className="font-bold text-purple-700">{item.title}</span>!
            </p>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              <div className="bg-yellow-100 px-3 py-1 rounded-xl shadow-sm">
                <p className="text-sm text-yellow-700 font-bold">
                  Cost: <span className="text-yellow-600">-{item.cost}</span> 🪙
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ),
      { duration: 3000, position: "top-center" }
    );
  };

  return (
    <>
      {/* Upper Panel */}
      <div className='flex flex-col sm:flex-row border rounded-3xl bg-[#111827] p-5 gap-5'>
        <div className='flex-1 flex flex-col gap-3'>
          <h1 className='font-exo font-bold text-white text-[3rem] sm:text-[5rem]'>DEVSHOP</h1>
          <p className='font-exo text-white text-sm sm:text-base w-[90%]'>
            Welcome to the DevLab Shop, where learning meets gamification! Earn rewards as you code, learn, and complete challenges, then spend them on awesome upgrades to enhance your experience.
          </p>
        </div>
        <div className='flex items-center gap-3.5 justify-center sm:justify-end'>
          <img src={MoneyIcon} alt="Coins" className='h-10 sm:h-14' />
          <p className='font-exo font-bold text-[#2CB67D] text-2xl sm:text-4xl'>{animatedValue}</p>
        </div>
      </div>

      {/* Shop Items */}
      <div className='max-h-[600px] sm:max-h-[500px] border border-[#36334B] w-full sm:w-[90%] lg:w-[80%] rounded-4xl overflow-y-scroll overflow-x-hidden mx-auto mt-8 p-4 Shop-container scrollbar-custom'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 p-2'>
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center">
              <Lottie animationData={Loading} loop={true} className="w-[40%] sm:w-[20%]" />
            </div>
          ) : (
            shopItems.map((item) => (
 <div
      key={item.id}
      className="p-[2px] rounded-xl bg-gradient-to-b from-teal-400 via-blue-500 to-purple-500 shadow-md h-full flex flex-col"
    >
      <div className="bg-[#0D1117] rounded-xl p-5 sm:p-7 flex flex-col items-center text-center h-full">
        {/* Icon */}
        <img src={icons[`../assets/ItemsIcon/${item.Icon}`]?.default} alt="" className='w-24 sm:w-32 mb-3 sm:mb-5' />
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-white font-exo">{item.title}</h2>
        {/* Description */}
        <p className="text-sm sm:text-base text-gray-300 flex-1">{item.desc}</p>
        {/* Buy Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ bounceDamping: 100 }}
          onClick={() => buyMutation.mutate(item)}
          className="bg-green-400 text-black font-bold py-2 px-6 sm:px-8 rounded-full text-base sm:text-lg mt-4 sm:mt-5"
        >
          {item.cost}
        </motion.button>
      </div>
    </div>
            ))
          )}
        </div>
      </div>

      {/* Buying Overlay */}
      {isBuying && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/95'>
          <Lottie animationData={Loading} loop={true} className="w-1/2 sm:w-1/4" />
        </div>
      )}
    </>
  );
}

export default Shop;
