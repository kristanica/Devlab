import { useMutation, useQueryClient } from "@tanstack/react-query";
import addStage from "./addStage";

export function useAddStage(activeTab) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["addStage", activeTab],
    mutationFn: addStage,

    onMutate: async (newStageData) => {
      await queryClient.cancelQueries(["lesson_data", activeTab]);
      const previousData = queryClient.getQueryData(["lesson_data", activeTab]);

      queryClient.setQueryData(["lesson_data", activeTab], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((lesson) => {
          if (`Lesson${lesson.Lesson}` !== newStageData.lessonId) return lesson;

          return {
            ...lesson,
            levels: lesson.levels.map((level) => {
              if (level.id !== newStageData.levelId) return level;

              const nextNumber = (level.stages?.length || 0) + 1;
              const optimisticStage = {
                id: `Stage${nextNumber}`,
                order: nextNumber,
                optimistic: true,
              };

              return {
                ...level,
                stages: [...(level.stages || []), optimisticStage],
              };
            }),
          };
        });
      });

      return { previousData };
    },

    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["lesson_data", activeTab], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["lesson_data", activeTab]);
    },
  });
}
