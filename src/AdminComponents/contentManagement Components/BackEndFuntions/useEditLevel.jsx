import { useMutation, useQueryClient } from "@tanstack/react-query";
import editLevel from "./editLevel";

export function useEditLevel(activeTab) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["editLevel", activeTab],
    mutationFn: editLevel,

    onSuccess: () => {
      queryClient.invalidateQueries(["lesson_data", activeTab]);
    },
  });
}
