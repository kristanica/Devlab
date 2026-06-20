// hooks/useAnimatedNumber.js
import { useState, useEffect } from "react";

export default function useAnimatedNumber(targetValue, duration = 500, frameRate = 30) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (targetValue == null) return;

    const start = animatedValue;
    const steps = Math.ceil(duration / frameRate);
    const stepAmount = (targetValue - start) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newValue = Math.round(start + stepAmount * currentStep);

      setAnimatedValue(() =>
        stepAmount > 0
          ? Math.min(newValue, targetValue)
          : Math.max(newValue, targetValue)
      );

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, frameRate);

    return () => clearInterval(interval);
  }, [targetValue, duration, frameRate]);

  return  {animatedValue};
}
  