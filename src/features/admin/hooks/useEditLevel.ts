import { useMutation, useQueryClient } from "@tanstack/react-query";
import editLevel, { EditLevelParams } from "../services/editLevel";

export function useEditLevel(activeTab: string) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, EditLevelParams>({
    mutationKey: ["editLevel", activeTab],
    mutationFn: editLevel,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_data", activeTab] });
    },
  });
}
