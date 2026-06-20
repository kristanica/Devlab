// src/AdminComponents/contentManagementComponents/BackEndFunctions/useDeleteStage.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import deleteStage from "./deleteStage";

export function useDeleteStage(category, lessonId, levelId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteStage", category, lessonId, levelId],
    mutationFn: (stageId) =>
      deleteStage({ category, lessonId, levelId, stageId }),

    //  Optimistic update
    onMutate: async (stageId) => {
      await queryClient.cancelQueries(["lesson_data", category]);
      const previousData = queryClient.getQueryData(["lesson_data", category]);

      // Immediately update UI
      queryClient.setQueryData(["lesson_data", category], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((lesson) => {
          if (`Lesson${lesson.Lesson}` !== lessonId) return lesson;

          return {
            ...lesson,
            levels: lesson.levels.map((level) => {
              if (level.id !== levelId) return level;

              return {
                ...level,
                stages: (level.stages || []).filter(
                  (stage) => stage.id !== stageId
                ),
              };
            }),
          };
        });
      });

      return { previousData };
    },

    //  Roll back if Firebase fails
    onError: (error, _, context) => {
      console.error("Stage deletion failed:", error);
      toast.error("Failed to delete stage.");

      if (context?.previousData) {
        queryClient.setQueryData(["lesson_data", category], context.previousData);
      }
    },

    //  On success
    onSuccess: () => {
      toast.success("Stage deleted successfully!");
    },

    //  Always refetch to confirm final data
    onSettled: () => {
      queryClient.invalidateQueries(["lesson_data", category]);
    },
  });
}
