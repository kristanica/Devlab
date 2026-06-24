import { useMutation, useQueryClient } from "@tanstack/react-query";
import addLevel, { AddLevelParams } from "../services/addLevel";

export function useAddLevel(activeTab: string) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AddLevelParams>({
    mutationKey: ["addLevel", activeTab],
    mutationFn: addLevel,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_data", activeTab] });
    },
  });
}
