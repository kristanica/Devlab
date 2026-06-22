# Handoff Report

## 1. Observation
We examined the following codebase files:
1. `src/pages/Shop.tsx`:
   - Line 11: `const { shopItems, isLoading } = useFetchShopItems();`
   - Line 13: `const { animatedValue } = useAnimatedNumber(userData?.coins);`
   - Line 17: `const buyMutation = useBuyMutation(userData, setIsBuying);`
   - Line 21: `<ShopHeader animatedValue={animatedValue} />`
   - Line 23: `<ShopItemGrid shopItems={shopItems} isLoading={isLoading} onBuy={(item) => buyMutation.mutate(item)} />`
2. `src/components/Shop/ShopItemGrid.tsx`:
   - Line 16: `{isLoading ? (...) : (...) }`
   - Line 52-59: `<motion.button onClick={() => onBuy(item)}>Buy for {item.cost} ...</motion.button>`
3. `src/components/Shop/ShopHeader.tsx`:
   - Line 35: `<p className="font-exo font-bold text-yellow-400 text-2xl sm:text-3xl tracking-tight leading-none">{animatedValue}</p>`
4. `src/components/BackEnd_Data/useFethShopItems.jsx`:
   - Line 13-14: `const res = await fetch(import.meta.env.VITE_BACK_END + "/fireBase/Shop", ...)`
5. `src/components/Shop/useBuyMutation.tsx`:
   - Line 62: `mutationFn: async (item: ShopItem) => purchaseItem(item.id, item.cost, item.Icon)`
   - Line 63-87: `onMutate` handler (performs optimistic local balance subtraction; throws `"Insufficient coins"` if `previousUserData.coins < item.cost`).
   - Line 93-108: `onError` handler (reverts query cache `["userData", userData?.uid]` to `previousUserData`).
6. `src/components/BackEnd_Functions/purchaseItem.jsx`:
   - Line 11-13: `const response = await axios.post(import.meta.env.VITE_BACK_END + "/fireBase/purchaseItem", ...)`
7. `src/components/Dashboard/InventoryVault.tsx`:
   - Line 23: `{inventory && inventory.length > 0 ? (...) : (...) }`
   - Line 46: `<div className="... text-indigo-300 font-mono text-sm font-bold">x{item.quantity}</div>`
   - Line 55-56: `<p className="text-slate-400 font-medium text-sm">Your vault is empty</p>`
8. `src/store/useInventoryStore.ts`:
   - Line 14: `export const useInventoryStore = create<InventoryStore>((set) => ({ ... }))`
   - Line 20: `useItem: async (itemId, buffName) => { ... }`
   - Line 34: `await updateDoc(itemRef, { quantity: increment(-1) });`
   - Line 39: `await deleteDoc(itemRef);`
9. `src/hooks/useUserInventory.ts`:
   - Line 16: `const unsubscribe = onSnapshot(inventoryRef, (snapshot) => { ... })`
10. `src/ItemsLogics/Items-Store/useInventoryStore.jsx`:
    - Line 1: `export { useInventoryStore } from "../../store/useInventoryStore";`
11. `src/ItemsLogics/ItemsUse.jsx`:
    - Line 19: `const useItem = useInventoryStore((state) => state.useItem);`
    - Line 61-149: `itemActions` mapping item titles (`CoinSurge`, `CodeWhisper`, `CodePatch`, `TimeFreeze`, `ErrorShield`, `BrainFilter`) to store/state mutations.
12. `tests/e2e/mocks/mockFirebase.ts`:
    - Line 132-135: `onSnapshot: (docRef: any, callback: any) => { return () => {}; }` (empty stub).

---

## 2. Logic Chain
1. **Shop System Flow**: Clicking the "Buy" button in `ShopItemGrid` triggers `useBuyMutation`. The mutation optimistically decrements the player's cash in the React Query cache `["userData"]` and triggers an Axios request to `/fireBase/purchaseItem`. If the request fails, the cache rolls back to `previousUserData`; if it succeeds, the queries are invalidated.
2. **Inventory System Flow**: `InventoryVault` displays items loaded via `useUserInventory`. The hook sets up a real-time Firestore listener using `onSnapshot` targeting `Users/[uid]/Inventory`. Using items during gameplay in `ItemsUse` calls the Zustand action `useItem`, which issues a Firestore `updateDoc` call decrementing quantity by 1 (or `deleteDoc` if quantity goes to 0).
3. **Mocking Limitation**: In the current test setup (`tests/e2e/mocks/mockFirebase.ts`), `onSnapshot` is mocked as a no-op returning an empty function (Line 132). This makes real-time E2E test synchronization verification impossible in the current mock setup unless the test framework is extended to support triggering mock snapshots.
4. **Test Design**:
   - For Shop: We designed tests covering **successful purchase**, **insufficient coins failure**, **network transaction failure/rollback**, **loading skeleton displays**, and **real-time balance synchronization**.
   - For Inventory: We designed tests covering **real-time vault items synchronization**, **buff activation & consumption**, **gamemode restrictions** (e.g. `CodeWhisper` block in `BrainBytes`), **multi-store interaction** (checking lives in `useAttemptStore` before consuming `CodePatch`), and **avatar equipping/unequipping** via file upload updates.

---

## 3. Caveats
- The application does not currently have a dedicated visual inventory "equipping" screen for avatar items; changing profile/cover images is handled via direct image upload inputs in Settings (`SettingsProfileImage.tsx`). Thus, our E2E design mock for avatar equipping/unequipping leverages Settings file uploads and Dashboard Profile Card updates.
- The `onSnapshot` Firebase mock is currently a placeholder stub and will need mock listener tracking logic before the designed E2E tests can run.

---

## 4. Conclusion
We have completed the investigation and designed 5 comprehensive E2E test scenarios for the Shop and 5 for the Inventory module. All selector targets, mock database initial states, MSW routes, and state updates have been clearly specified and documented in `analysis.md`. The design is ready for implementation by the next agent.

---

## 5. Verification Method
To verify the E2E designs and the current infrastructure setup:
1. Verify that standard e2e tests run by executing the script in the project root:
   ```powershell
   pnpm test:e2e
   ```
2. Inspect the created `analysis.md` file:
   ```powershell
   cat C:\Users\lain\Documents\code\Devlab\.agents\explorer_e2e_tests_4\analysis.md
   ```
3. Verify that the files listed as out-of-scope/read-only were not edited.
