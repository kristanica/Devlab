import React, { useState } from "react";
import useFetchShopItems from '@/services/api/useFethShopItems';
import useFetchUserData from '@/services/api/useFetchUserData';
import useAnimatedNumber from "../hooks/useAnimatedNumber";

import ShopHeader from "../components/Shop/ShopHeader";
import ShopItemGrid from "../components/Shop/ShopItemGrid";
import { useBuyMutation } from "../components/Shop/useBuyMutation";

const Shop: React.FC = () => {
  const { shopItems, isLoading } = useFetchShopItems();
  const { userData } = useFetchUserData();
  const { animatedValue } = useAnimatedNumber(userData?.coins);
  const [isBuying, setIsBuying] = useState(false);

  // Extracted mutation logic
  const buyMutation = useBuyMutation(userData, setIsBuying);

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 bg-[#06060a] min-h-screen text-slate-200 selection:bg-purple-500/30 font-inter overflow-y-auto overflow-x-hidden">
      <ShopHeader animatedValue={animatedValue} />

      <ShopItemGrid
        shopItems={shopItems}
        isLoading={isLoading}
        onBuy={(item) => buyMutation.mutate(item)}
      />
    </div>
  );
};

export default Shop;
