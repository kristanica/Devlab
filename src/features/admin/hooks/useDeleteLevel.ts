import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteLevel, { DeleteLevelParams } from "../services/deleteLevel";
import { SubjectLesson } from "../types";

export function useDeleteLevel(activeTab: string) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, DeleteLevelParams, { previousData: SubjectLesson[] | undefined }>({
    mutationKey: ["deleteLevel", activeTab],
    mutationFn: deleteLevel,

    // Optimistic update
    onMutate: async (deleteData) => {
      await queryClient.cancelQueries({ queryKey: ["lesson_data", activeTab] });

      // Save previous cache to rollback if something fails
      const previousData = queryClient.getQueryData<SubjectLesson[]>(["lesson_data", activeTab]);

      // Immediately remove the level from UI
      queryClient.setQueryData<SubjectLesson[]>(["lesson_data", activeTab], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((lesson) => {
          if (`Lesson${lesson.Lesson}` !== deleteData.lessonId) return lesson;

          return {
            ...lesson,
            levels: lesson.levels.filter(
              (lvl) => lvl.id !== deleteData.levelId
            ),
          };
        });
      });

      // Return previous data for rollback
      return { previousData };
    },

    // Rollback if Firebase fails
    onError: (error, variables, context) => {
      console.error("Failed to delete level:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["lesson_data", activeTab], context.previousData);
      }
    },

    // Always refetch after mutation completes
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_data", activeTab] });
    },
  });
}
