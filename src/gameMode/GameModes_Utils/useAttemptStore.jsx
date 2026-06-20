import { useMemo } from "react";
import { createUseAttemptStore } from "./useAttemptStore_Local";
import { auth } from "../../Firebase/Firebase";

let storeCache = {};

export function useAttemptStore(selector) {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid; // optional chaining

  const store = useMemo(() => {
    if (!uid) return null; // return null if no user yet

    if (!storeCache[uid]) {
      storeCache[uid] = createUseAttemptStore(uid);
    }
    return storeCache[uid];
  }, [uid]);

  if (!store) return undefined; // avoid crash
  return store(selector);
}
