import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import deleteStage from "../services/deleteStage";
import { SubjectLesson } from "../types";

export function useDeleteStage(category: string, lessonId: string, levelId: string) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string, { previousData: SubjectLesson[] | undefined }>({
    mutationKey: ["deleteStage", category, lessonId, levelId],
    mutationFn: (stageId: string) =>
      deleteStage({ category, lessonId, levelId, stageId }),

    // Optimistic update
    onMutate: async (stageId: string) => {
      await queryClient.cancelQueries({ queryKey: ["lesson_data", category] });
      const previousData = queryClient.getQueryData<SubjectLesson[]>(["lesson_data", category]);

      // Immediately update UI
      queryClient.setQueryData<SubjectLesson[]>(["lesson_data", category], (oldData) => {
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

    // Roll back if Firebase fails
    onError: (error, variables, context) => {
      console.error("Stage deletion failed:", error);
      toast.error("Failed to delete stage.");

      if (context?.previousData) {
        queryClient.setQueryData(["lesson_data", category], context.previousData);
      }
    },

    // On success
    onSuccess: () => {
      toast.success("Stage deleted successfully!");
    },

    // Always refetch to confirm final data
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_data", category] });
    },
  });
}
