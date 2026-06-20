import { useMutation, useQueryClient } from "@tanstack/react-query";
import addLevel from "./addLevel";

export function useAddLevel(activeTab) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["addLevel", activeTab],
    mutationFn: addLevel,

    onSuccess: () => {
      queryClient.invalidateQueries(["lesson_data", activeTab]);
    },
  });
}
