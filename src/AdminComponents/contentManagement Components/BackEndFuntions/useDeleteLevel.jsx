// src/AdminComponents/contentManagementComponents/BackEndFunctions/useDeleteLevel.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteLevel from "./deleteLevel";

export function useDeleteLevel(activeTab) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteLevel", activeTab],
    mutationFn: deleteLevel,

    //  Optimistic update
    onMutate: async (deleteData) => {
      await queryClient.cancelQueries(["lesson_data", activeTab]);

      // Save previous cache to rollback if something fails
      const previousData = queryClient.getQueryData(["lesson_data", activeTab]);

      // Immediately remove the level from UI
      queryClient.setQueryData(["lesson_data", activeTab], (oldData) => {
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

    //  Rollback if Firebase fails
    onError: (error, _, context) => {
      console.error("Failed to delete level:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["lesson_data", activeTab], context.previousData);
      }
    },

    //  Always refetch after mutation completes
    onSettled: () => {
      queryClient.invalidateQueries(["lesson_data", activeTab]);
    },
  });
}
