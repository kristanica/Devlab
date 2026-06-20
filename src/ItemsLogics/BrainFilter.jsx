// src/ItemsLogics/PerfectPrecision.js
import { useInventoryStore } from "./Items-Store/useInventoryStore";

export async function BrainFilter(optionsArray, correctAnswer) {

  const { removeBuff } = useInventoryStore.getState();
  // Find wrong options
  const wrongOptions = optionsArray.filter(([key]) => key !== correctAnswer);

  if (wrongOptions.length === 0) return optionsArray; // nothing to remove

  // Pick one random wrong option to remove
  const randomIndex = Math.floor(Math.random() * wrongOptions.length);
  const optionToRemove = wrongOptions[randomIndex][0];

  // Remove from options array
  const filteredOptions = optionsArray.filter(
    ([key]) => key !== optionToRemove
  );

  // Remove the buff (single-use)
  removeBuff("brainFilter");
  console.log("removing the area")
  return filteredOptions;
}
