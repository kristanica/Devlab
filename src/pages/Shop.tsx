import React, { useState, useRef, useEffect } from "react";
import useFetchShopItems from '@/services/api/useFethShopItems';
import useFetchUserData from '@/services/api/useFetchUserData';
import useAnimatedNumber from "../hooks/useAnimatedNumber";

import ShopHeader from "../features/shop/components/ShopHeader";
import ShopItemGrid from "../features/shop/components/ShopItemGrid";
import { useBuyMutation } from "../features/shop/components/useBuyMutation";

const Shop: React.FC = () => {
  const { shopItems, isLoading } = useFetchShopItems();
  const { userData } = useFetchUserData();
  const safeCoins = typeof userData?.coins === 'number' && !isNaN(userData.coins) ? userData.coins : 0;
  const { animatedValue } = useAnimatedNumber(safeCoins);
  const [isBuying, setIsBuying] = useState(false);
  const purchasingItems = useRef(new Set<string>());

  const buyMutation = useBuyMutation(userData, setIsBuying);

  useEffect(() => {
    if (!isBuying) {
      purchasingItems.current.clear();
    }
  }, [isBuying]);

  const handleBuy = (item: any) => {
    if (purchasingItems.current.has(item.id)) return;
    purchasingItems.current.add(item.id);
    buyMutation.mutate(item);
  };

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 bg-[#06060a] min-h-screen text-slate-200 selection:bg-purple-500/30 font-inter overflow-y-auto overflow-x-hidden">
      <ShopHeader animatedValue={animatedValue} />

      <ShopItemGrid
        shopItems={shopItems}
        isLoading={isLoading}
        isBuying={isBuying}
        onBuy={handleBuy}
      />
    </div>
  );
};

export default Shop;
