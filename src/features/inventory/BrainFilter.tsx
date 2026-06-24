import { useInventoryStore } from "@/store/useInventoryStore";

export async function BrainFilter(optionsArray: [string, string][], correctAnswer: string): Promise<[string, string][]> {

  const { removeBuff } = useInventoryStore.getState();
  const wrongOptions = optionsArray.filter(([key]) => key !== correctAnswer);

  if (wrongOptions.length === 0) return optionsArray;

  const randomIndex = Math.floor(Math.random() * wrongOptions.length);
  const optionToRemove = wrongOptions[randomIndex][0];

  const filteredOptions = optionsArray.filter(
    ([key]) => key !== optionToRemove
  );

  removeBuff("brainFilter");
  console.log("removing the area")
  return filteredOptions;
}
