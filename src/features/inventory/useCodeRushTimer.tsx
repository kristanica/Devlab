import { useEffect, useState } from "react";
import { useInventoryStore } from "@/store/useInventoryStore";

export default function useCodeRushTimer(
  initialTime: number,
  gamemodeId: string,
  gameModeData: any,
  showPopup: boolean,
  pauseTimer: boolean,
  resetSignal: number,
  isStageCompleted: boolean = false
): [number, boolean, string] {
  const [timer, setTimer] = useState(1);
  const [buffApplied, setBuffApplied] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [buffType, setBuffType] = useState("");

  const activeBuffs = useInventoryStore((state) => state.activeBuffs);
  const { removeBuff } = useInventoryStore.getState();

  const STORAGE_KEY = `coderush_remaining_${gamemodeId}`;
  const TICK_KEY = `coderush_last_tick_${gamemodeId}`;

  useEffect(() => {
  if (gamemodeId !== "CodeRush") return;
  if (!initialTime || initialTime <= 0) return;

  const savedRemaining = localStorage.getItem(STORAGE_KEY);

  if (savedRemaining != null) {
    setTimer(parseInt(savedRemaining, 10));
    return;
  }

  setTimer(initialTime);
  localStorage.setItem(STORAGE_KEY, String(initialTime));
  localStorage.setItem(TICK_KEY, String(Math.floor(Date.now() / 1000)));
}, [gamemodeId, initialTime]);



  useEffect(() => {
    if (gamemodeId !== "CodeRush") return;
    if (initialTime == null || initialTime <= 0) return;

    setTimer(initialTime);
    setBuffApplied(false);
    setIsFrozen(false);

    localStorage.setItem(STORAGE_KEY, String(initialTime));
    localStorage.setItem(TICK_KEY, String(Math.floor(Date.now() / 1000)));
  }, [resetSignal]);

  useEffect(() => {
    if (gamemodeId !== "CodeRush") return;
    if (timer <= 0 || showPopup || isFrozen || pauseTimer || isStageCompleted) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const updated = Math.max(prev - 1, 0);

        localStorage.setItem(STORAGE_KEY, String(updated));
        localStorage.setItem(TICK_KEY, String(Math.floor(Date.now() / 1000)));

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamemodeId, showPopup, isFrozen, pauseTimer, timer, isStageCompleted]);

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
