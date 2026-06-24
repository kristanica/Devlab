import { useMutation, useQueryClient } from "@tanstack/react-query";
import addStage, { AddStageParams } from "../services/addStage";
import { SubjectLesson } from "../types";

export function useAddStage(activeTab: string) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AddStageParams, { previousData: SubjectLesson[] | undefined }>({
    mutationKey: ["addStage", activeTab],
    mutationFn: addStage,

    onMutate: async (newStageData) => {
      await queryClient.cancelQueries({ queryKey: ["lesson_data", activeTab] });
      const previousData = queryClient.getQueryData<SubjectLesson[]>(["lesson_data", activeTab]);

      queryClient.setQueryData<SubjectLesson[]>(["lesson_data", activeTab], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((lesson) => {
          if (`Lesson${lesson.Lesson}` !== newStageData.lessonId) return lesson;

          return {
            ...lesson,
            levels: lesson.levels.map((level) => {
              if (level.id !== newStageData.levelId) return level;

              const nextNumber = (level.stages?.length || 0) + 1;
              const optimisticStage: any = {
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

    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["lesson_data", activeTab], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_data", activeTab] });
    },
  });
}
