import { useEffect, useState } from "react";
import { useInventoryStore } from "./Items-Store/useInventoryStore";

export default function useCodeRushTimer(
  initialTime,
  gamemodeId,
  gameModeData,
  showPopup,
  pauseTimer,
  resetSignal,
  isStageCompleted = false // ✅ new param
) {
  const [timer, setTimer] = useState(1);
  const [buffApplied, setBuffApplied] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [buffType, setBuffType] = useState("");

  const activeBuffs = useInventoryStore((state) => state.activeBuffs);
  const { removeBuff } = useInventoryStore.getState();

  const STORAGE_KEY = `coderush_remaining_${gamemodeId}`;
  const TICK_KEY = `coderush_last_tick_${gamemodeId}`;

  // ----------------- INIT TIMER -----------------
useEffect(() => {
  if (gamemodeId !== "CodeRush") return;
  if (!initialTime || initialTime <= 0) return;

  // Try to load saved remaining time
  const savedRemaining = localStorage.getItem(STORAGE_KEY);

  if (savedRemaining != null) {
    // Resume from saved remaining time (ignore elapsed)
    setTimer(parseInt(savedRemaining, 10));
    return;
  }

  // No saved timer → start fresh
  setTimer(initialTime);
  localStorage.setItem(STORAGE_KEY, initialTime);
  localStorage.setItem(TICK_KEY, Math.floor(Date.now() / 1000));
}, [gamemodeId, initialTime]);



  // ----------------- RESET SIGNAL -----------------
  useEffect(() => {
    if (gamemodeId !== "CodeRush") return;
    if (initialTime == null || initialTime <= 0) return;

    setTimer(initialTime); // ✅ leave as original value
    setBuffApplied(false);
    setIsFrozen(false);

    localStorage.setItem(STORAGE_KEY, initialTime);
    localStorage.setItem(TICK_KEY, Math.floor(Date.now() / 1000));
  }, [resetSignal]);

  // ----------------- COUNTDOWN -----------------
  useEffect(() => {
    if (gamemodeId !== "CodeRush") return;
    if (timer <= 0 || showPopup || isFrozen || pauseTimer || isStageCompleted) return; // ✅ skip countdown if completed

    const interval = setInterval(() => {
      setTimer((prev) => {
        const updated = Math.max(prev - 1, 0);

        // Persist timer state
        localStorage.setItem(STORAGE_KEY, updated);
        localStorage.setItem(TICK_KEY, Math.floor(Date.now() / 1000));

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamemodeId, showPopup, isFrozen, pauseTimer, timer, isStageCompleted]);

  // ----------------- BUFFS -----------------
  useEffect(() => {
    if (gamemodeId !== "CodeRush") return;
    if (!activeBuffs.length) return;

    if (activeBuffs.includes("timeFreeze")) {
      setIsFrozen(true);
      setBuffApplied(true);
      setBuffType("timeFreeze");

      removeBuff("timeFreeze");

      setTimeout(() => {
        setIsFrozen(false);
        setBuffApplied(false);
      }, 5000);
    }
  }, [gamemodeId, activeBuffs, removeBuff]);

  return [timer, buffApplied, buffType];
}
