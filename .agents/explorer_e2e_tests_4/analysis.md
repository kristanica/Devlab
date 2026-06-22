# End-to-End (E2E) Test Scenario Analysis & Specifications

This document outlines the detailed design and specifications for 10 comprehensive E2E test scenarios: 5 for the **Shop** module and 5 for the **Inventory** module. These designs are fully aligned with the codebase architecture, Firebase mocks, and MSW setup.

---

## 1. Codebase Architecture Review & Integration Points

### A. Shop Module
* **Entry Point**: `src/pages/Shop.tsx`
  - Fetches shop items via `useFetchShopItems()` and user details via `useFetchUserData()`.
  - Drives mutations via `useBuyMutation()`.
* **Visual Components**:
  - `src/components/Shop/ShopHeader.tsx`: Displays page header and the user's current DevCoin balance (animated via the `useAnimatedNumber` hook).
  - `src/components/Shop/ShopItemGrid.tsx`: Maps available shop items or displays 6 loading skeleton cards when `isLoading` is true. Handles buying actions via `onBuy(item)`.
* **Data Flow & Hooks**:
  - `src/components/BackEnd_Data/useFethShopItems.jsx`: React Query hook using query key `["ShopItems"]` targeting the endpoint `GET /fireBase/Shop`.
  - `src/components/Shop/useBuyMutation.tsx` / `src/components/BackEnd_Functions/purchaseItem.jsx`: Triggers purchase sound, performs an optimistic local query cache decrement of user coins, runs validation (checks for sufficient coins), posts to `POST /fireBase/purchaseItem`, and triggers cache invalidations on success or rolls back the cache on failure.

### B. Inventory Module
* **Entry Point**: `src/components/Dashboard/InventoryVault.tsx` (rendered on `src/pages/Dashboard.tsx`).
  - Displays user's vault items. Shows `🎒` and "Your vault is empty" empty state when empty, or lists items with names, consumable tag, icons, and quantity badges.
* **Gameplay HUD Component**: `src/ItemsLogics/ItemsUse.jsx`
  - Floating inventory drawer triggered by clicking a treasure chest (`PiTreasureChest`).
  - Fetches inventory in real-time and enables clicking power-ups to activate buffs (e.g. `CoinSurge`, `CodeWhisper`, `CodePatch`, `TimeFreeze`, `ErrorShield`, `BrainFilter`).
  - Validates game mode restrictions (e.g. `CodeWhisper` is banned in `BrainBytes`, `TimeFreeze` is locked to `CodeRush`, items cannot be used in `Lesson` mode).
* **Zustand Store**: `src/store/useInventoryStore.ts` (re-exported by `src/ItemsLogics/Items-Store/useInventoryStore.jsx`).
  - State: `inventory` (array of `InventoryItem`), `activeBuffs` (string list of active buffs).
  - Actions: `useItem(itemId, buffName)` (adds buff to activeBuffs, decrements quantity in Firestore document, and deletes document if quantity is 0) and `removeBuff(buffName)`.
* **Data Flow & Hooks**:
  - `src/hooks/useUserInventory.ts`: Listens to Firestore path `Users/[uid]/Inventory` using real-time `onSnapshot`.
  - `src/components/Settings/SettingsProfileImage.tsx`: Handles avatar uploads and Firestore updates, syncing custom profile/background images back to the profile card.

---

## 2. Shop E2E Test Scenarios (5 Scenarios)

### Scenario 1: Successful Purchase of a Power-up Item (with Sufficient Coins)
* **Goal**: Verify that a user with sufficient coins can buy a power-up, causing an optimistic balance update, sound execution, API trigger, and success toast.
* **Initial Mock State**:
  - Auth: `mockCurrentUser = { uid: "user-123", email: "user@devlab.com" }`
  - Firestore DB: `mockDb.users["user-123"] = { username: "TestCoder", coins: 500 }`
  - React Query Cache: `["userData"] = { coins: 500, uid: "user-123" }`
* **MSW Interceptors**:
  - `GET */fireBase/Shop` -> Return status 200 with payload:
    ```json
    [
      { "id": "coin-surge-id", "title": "CoinSurge", "cost": 100, "Icon": "CoinSurge.png", "desc": "Doubles coins earned." }
    ]
    ```
  - `POST */fireBase/purchaseItem` -> Intercept payload `{ itemId: "coin-surge-id", itemCost: 100, itemName: "CoinSurge.png" }` and return status 200 with:
    ```json
    { "success": true, "message": "Purchase completed", "newCoins": 400 }
    ```
* **Step-by-Step User Actions**:
  1. Render `<Shop />` component.
  2. Verify initial coin balance displays `500` in the header.
  3. Locate the `CoinSurge` item card and click the `"Buy for 100"` button.
* **Target DOM Elements**:
  - Balance Display: Query by text content `"500"` inside the coin balance panel (located under `ShopHeader`).
  - Buy Button: Button containing text `"Buy for 100"` and a coin image wrapper.
  - Toast Container: Custom toast element containing text `"Purchase Successful!"` and `"Acquired CoinSurge"`.
* **Expected State Updates & Assertions**:
  - Sound handler `playSound("purchase")` is triggered.
  - Optimistic query update triggers immediately, setting `["userData"]` balance to `400` in the Query Client.
  - UI coin balance display smoothly transitions to `400`.
  - POST request is sent to `/fireBase/purchaseItem` with correct item payload.
  - Toast message appears on screen.
  - Queries `["userData", "user-123"]` and `["shopItems"]` are invalidated.

### Scenario 2: Failed Purchase due to Insufficient Coins
* **Goal**: Verify that a user cannot purchase an item if it costs more than their coin balance, showing an error toast and triggering no network requests.
* **Initial Mock State**:
  - Auth: `mockCurrentUser = { uid: "user-123", email: "user@devlab.com" }`
  - Firestore DB: `mockDb.users["user-123"] = { username: "TestCoder", coins: 50 }`
  - React Query Cache: `["userData"] = { coins: 50, uid: "user-123" }`
* **MSW Interceptors**:
  - `GET */fireBase/Shop` -> Return status 200 with:
    ```json
    [
      { "id": "time-freeze-id", "title": "TimeFreeze", "cost": 150, "Icon": "TimeFreeze.png", "desc": "Freezes timers." }
    ]
    ```
* **Step-by-Step User Actions**:
  1. Render `<Shop />` component.
  2. Locate the `TimeFreeze` item card.
  3. Click the `"Buy for 150"` button.
* **Target DOM Elements**:
  - Balance Panel: Displays `"50"`.
  - Buy Button: Button containing text `"Buy for 150"`.
  - Toast Alert: Error toast with text `"Not enough DevCoins!"`.
* **Expected State Updates & Assertions**:
  - Mutation rejects immediately inside the `onMutate` optimistic check.
  - Toast error `"Not enough DevCoins!"` is injected into the DOM.
  - No `POST` API call to `/fireBase/purchaseItem` is dispatched.
  - The Query Client cache and the balance display remain unchanged at `50`.

### Scenario 3: API Purchase Failure & Optimistic Rollback
* **Goal**: Verify that if a user has sufficient coins but the server/database transaction fails, the UI reverts the optimistic balance change and shows an error.
* **Initial Mock State**:
  - Auth: `mockCurrentUser = { uid: "user-123", email: "user@devlab.com" }`
  - Firestore DB: `mockDb.users["user-123"] = { username: "TestCoder", coins: 300 }`
  - React Query Cache: `["userData"] = { coins: 300, uid: "user-123" }`
* **MSW Interceptors**:
  - `GET */fireBase/Shop` -> Return status 200 with:
    ```json
    [
      { "id": "error-shield-id", "title": "ErrorShield", "cost": 200, "Icon": "ErrorShield.png", "desc": "Shields errors." }
    ]
    ```
  - `POST */fireBase/purchaseItem` -> Return status 500 with `{ error: "Transaction aborted" }`.
* **Step-by-Step User Actions**:
  1. Render `<Shop />` component.
  2. Click the `"Buy for 200"` button on the `ErrorShield` card.
* **Target DOM Elements**:
  - Balance panel: Text changes from `"300"` -> `"100"` -> `"300"`.
  - Toast container: Toast alert displaying `"Purchase failed. Try again!"`.
* **Expected State Updates & Assertions**:
  - On click, `onMutate` executes: plays sound, caches previous user data, and updates cache balance to `100`.
  - UI display transitions to `100`.
  - POST request is sent to `/fireBase/purchaseItem` and receives a 500 error response.
  - Mutation's `onError` callback fires: restores the Query Client cache to `previousUserData` (balance 300).
  - UI balance transitions back to `300`.
  - Error toast `"Purchase failed. Try again!"` is displayed.

### Scenario 4: Shop Grid Skeleton Loading State
* **Goal**: Verify that during item retrieval, loading skeleton templates are correctly rendered in the DOM, then disappear once the API query resolves.
* **Initial Mock State**:
  - Shop items loading state: `isLoading = true`
* **MSW Interceptors**:
  - `GET */fireBase/Shop` -> Delayed response (500ms) returning a list of shop items.
* **Step-by-Step User Actions**:
  1. Render `<Shop />` component.
  2. Observe the skeleton animations during loading.
  3. Wait for the delay to expire and observe item grid rendering.
* **Target DOM Elements**:
  - Skeleton Cards: Class name `animate-pulse` and `bg-[#0d0d12] border border-[#1e1e2e]`.
  - Shop Item Grid Title: Header `<h2>` with text `"Available Items"`.
  - Loaded Cards: Header elements `<h3>` with text matching item titles.
* **Expected State Updates & Assertions**:
  - While `isLoading` is true, 6 pulsing placeholders exist in the DOM.
  - Once the MSW promise resolves, the skeleton elements are removed from the document tree.
  - Shop item grid lists the actual fetched items.

### Scenario 5: Real-time Coin Balance Synchronization
* **Goal**: Verify that changes in the user's coin balance from external triggers (such as finishing tasks in another tab) are propagated to the shop page in real time.
* **Initial Mock State**:
  - Auth: `mockCurrentUser = { uid: "user-123" }`
  - React Query Cache starts with: `["userData"] = { coins: 100 }`
* **MSW Interceptors**:
  - `GET */fireBase/getSpecificUser/user-123` -> Return status 200 with `{ coins: 100 }`.
* **Step-by-Step User Actions**:
  1. Render `<Shop />` component.
  2. Verify the initial balance is `100`.
  3. Simulate an external wallet increase by manually updating the react-query cache or updating MSW response and calling `refetch()` from the query.
* **Target DOM Elements**:
  - Balance Panel Text: Starts at `100`, updates to `450`.
* **Expected State Updates & Assertions**:
  - The Query Client cache for key `["userData"]` is updated to `{ coins: 450 }`.
  - The hook `useAnimatedNumber` intercepts the update and schedules an animation.
  - UI display elements display the updated value of `450`.

---

## 3. Inventory E2E Test Scenarios (5 Scenarios)

### Scenario 1: Real-time Sync of Vault Items (Empty vs Populated Vault)
* **Goal**: Verify the Dashboard's `InventoryVault` transitions seamlessly from an empty state to an itemized list when the Firestore real-time snapshot is updated.
* **Initial Mock State**:
  - Auth: `mockCurrentUser = { uid: "user-123" }`
  - Firestore state: `mockDb.inventory["user-123"]` is empty `{}`.
* **Firestore Mocking Strategy**:
  - Replace the dummy `onSnapshot` in `tests/e2e/mocks/mockFirebase.ts` with a mock listener tracker:
    ```typescript
    let snapshotListeners: Array<(snapshot: any) => void> = [];
    export const triggerInventoryUpdate = (items: any[]) => {
      const docs = items.map(item => ({
        id: item.id,
        data: () => ({ title: item.title, Icon: item.Icon, quantity: item.quantity })
      }));
      snapshotListeners.forEach(cb => cb({ docs }));
    };
    ```
* **Step-by-Step User Actions**:
  1. Render `<Dashboard />` (which encapsulates `InventoryVault`).
  2. Verify the display of the empty vault panel.
  3. Trigger the mock Firestore real-time snapshot update.
* **Target DOM Elements**:
  - Empty Icon: Element containing the `🎒` emoji or text `"Your vault is empty"`.
  - Subtext: Text `"Complete missions or visit the shop to acquire items."`.
  - Item list items: Elements with text `"Coin Surge"` and quantity container `"x1"`.
* **Expected State Updates & Assertions**:
  - Initial UI displays the empty state message.
  - After executing `triggerInventoryUpdate([{ id: "item-1", title: "Coin Surge", Icon: "CoinSurge.png", quantity: 1 }])`, the `useUserInventory` hook state updates.
  - Empty state elements are removed.
  - The vault list renders the "Coin Surge" item card with quantity `x1`.

### Scenario 2: Power-up Activation and Consumption
* **Goal**: Verify that activating a power-up inside a gamemode updates Zustand store active buffs, updates Firestore, and displays a success toast.
* **Initial Mock State**:
  - Gamemode Context: `gamemodeId = "CodeRush"`
  - Zustand `useInventoryStore` State: `{ inventory: [], activeBuffs: [] }`
  - Firestore Inventory:
    ```json
    {
      "user-123": {
        "coin-surge-id": { "title": "CoinSurge", "Icon": "CoinSurge.png", "quantity": 1 }
      }
    }
    ```
* **Firestore Mocking Strategy**:
  - Mock `updateDoc` to intercept decrement actions.
  - Mock `deleteDoc` to intercept clean-up when quantity hits 0.
* **Step-by-Step User Actions**:
  1. Render gameplay HUD component `<ItemsUse gamemodeId="CodeRush" setShowCodeWhisper={vi.fn()} />`.
  2. Click the treasure chest toggle button.
  3. Click on the `"Coin Surge"` button in the popup drawer.
* **Target DOM Elements**:
  - Chest Button: `PiTreasureChest` icon button.
  - Item Button: Button with text `"Coin Surge"` and badge `"1"`.
  - Success Toast: Custom toast with title `"⚡ Coin Surge activated!"`.
* **Expected State Updates & Assertions**:
  - Zustand store's `activeBuffs` updates to include `"doubleCoins"`.
  - Firestore `updateDoc` is called on document path `Users/user-123/Inventory/coin-surge-id` with `{ quantity: increment(-1) }`.
  - Since quantity becomes `0`, `deleteDoc` is called on the document path.
  - The drawer's items array updates (via real-time sync), removing the item.
  - Toast container displays `"⚡ Coin Surge activated!"`.

### Scenario 3: Gamemode-Specific Usage Restrictions
* **Goal**: Verify that gameplay power-ups respect gamemode limitations (e.g. `CodeWhisper` cannot be activated in `BrainBytes` mode, and no items are allowed in `Lesson` mode).
* **Initial Mock State**:
  - Zustand `useInventoryStore` State: `{ activeBuffs: [] }`
  - Firestore inventory contains a `CodeWhisper` item:
    `Users/user-123/Inventory/code-whisper-id = { title: "CodeWhisper", Icon: "CodeWhisper.png", quantity: 1 }`
* **Step-by-Step User Actions**:
  1. Render `<ItemsUse gamemodeId="BrainBytes" setShowCodeWhisper={vi.fn()} />`.
  2. Click the chest icon to view items.
  3. Click the `"Code Whisper"` item button.
* **Target DOM Elements**:
  - Drawer Item: `"Code Whisper"` button.
  - Toast Container: Error toast with text `"Code Whisper cannot be used in BrainBytes mode"`.
* **Expected State Updates & Assertions**:
  - Toast error is injected.
  - Zustand store's `activeBuffs` remains empty `[]`.
  - No Firestore document update is sent (item quantity remains `1`).

### Scenario 4: Complex Multi-Store Interaction (`CodePatch` & Lives System)
* **Goal**: Verify that using `CodePatch` interacts with `useAttemptStore`, checking current lives before consuming inventory documents.
* **Initial Mock State**:
  - Zustand `useInventoryStore` inventory contains:
    `[{ id: "code-patch-id", title: "CodePatch", Icon: "CodePatch.png", quantity: 2 }]`
  - Zustand `useAttemptStore` state: `lives = 3` (maximum value).
* **Step-by-Step User Actions**:
  1. Render `<ItemsUse gamemodeId="CodeRush" />`.
  2. Open the inventory drawer and click `"Code Patch"`.
  3. Assert that error toast `"You already have maximum lives!"` appears.
  4. Manually decrement current lives in `useAttemptStore` to `2`.
  5. Click `"Code Patch"` again.
* **Target DOM Elements**:
  - Item Button: `"Code Patch"` drawer button.
  - Error Toast: text `"You already have maximum lives!"`.
  - Success Toast: text `"⚡ Code Patch activated!"`.
  - Quantity Badge: Displays `"2"`, then `"1"`.
* **Expected State Updates & Assertions**:
  - First Click: `applyExtraLives()` returns false. No change.
  - Second Click: `applyExtraLives()` returns true. `useAttemptStore` state updates to `lives: 3`.
  - `useInventoryStore` calls `useItem("code-patch-id", "extraLives")`.
  - Firestore doc `Users/user-123/Inventory/code-patch-id` quantity decrements to `1`.
  - Success toast is shown.

### Scenario 5: Equipping and Unequipping Avatar Items (Profile Customization)
* **Goal**: Verify that uploading a new avatar image updates the user's document in Firestore, propagates to the Profile card, and handles reverting (unequipping).
* **Initial Mock State**:
  - Auth: `mockCurrentUser = { uid: "user-123" }`
  - Firestore User Doc: `{ username: "TestCoder", profileImage: "" }` (empty represents default avatar).
* **Mock Storage Configuration**:
  - Set up mock upload tasks for `firebase/storage` `uploadBytesResumable` that resolve with:
    `https://mockstorage.local/userProfiles/user-123/profile.jpg`
* **Step-by-Step User Actions**:
  1. Render `<SettingsProfileImage userData={{ username: "TestCoder", profileImage: "" }} uploadImage={mockUploadFn} refetch={mockRefetchFn} />`.
  2. Select and upload a mock image file using the profile input element.
  3. Render `<ProfileCard userData={{ username: "TestCoder", profileImage: "https://mockstorage.local/userProfiles/user-123/profile.jpg" }} animatedExp={0} />`.
  4. Perform the "unequip/reset" avatar action (uploading a null or blank input, or clicking a reset option).
* **Target DOM Elements**:
  - File Input: Hidden file input `input[type="file"]`.
  - Settings Avatar Image: Img element with src.
  - ProfileCard Avatar: Img element with src.
  - Success Toast: text `"Profile picture updated!"`.
* **Expected State Updates & Assertions**:
  - File selection triggers storage upload.
  - Firestore `setDoc` updates `profileImage` field to the mock URL.
  - Toast `"Profile picture updated!"` appears.
  - `ProfileCard` updates to render `src="https://mockstorage.local/userProfiles/user-123/profile.jpg"`.
  - Resetting/reverting updates Firestore `profileImage` to `""`.
  - `ProfileCard` transitions back to rendering the default profile image `profile_handler.png`.

---

## 4. DOM Selection & Query Strategy Matrix

To minimize test brittleness, the following DOM query selectors are recommended for E2E assertions:

| Logical Component | Visual Target | Best Query Method | Recommended Selector / Test ID |
| :--- | :--- | :--- | :--- |
| **Shop Header** | Coin Balance Display | `getByRole` or `getByText` | `screen.getByText("Balance").nextSibling` or `<span data-testid="coin-balance">` |
| **Shop Item Grid** | Item Cards | `getByRole('heading')` | `screen.getByRole('heading', { name: "Available Items" })` |
| **Shop Item Grid** | Cost Button | `getByRole('button')` | `screen.getByRole('button', { name: /Buy for \d+/i })` |
| **Shop Item Grid** | Item Icon | `getByAltText` | `screen.getByAltText(itemTitle)` |
| **Inventory Vault**| Empty State Icon | `getByText` | `screen.getByText("Your vault is empty")` |
| **Inventory Vault**| Item Quantity Badge | `getByText` | `screen.getByText(/x\d+/)` |
| **Inventory HUD** | Chest Toggle Icon | `getByTestId` | Add `data-testid="chest-toggle"` to `<PiTreasureChest>` |
| **Inventory HUD** | Drawer Container | `getByRole` or `getByTestId` | `data-testid="inventory-drawer"` |
| **Profile Card** | Profile Avatar Image | `getByAltText` | `screen.getByAltText("Profile")` |
| **Profile Card** | Coin Count | `getByAltText` + sibling | `screen.getByAltText("Coins").nextSibling` |
