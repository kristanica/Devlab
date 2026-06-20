import { useMutation, useQueryClient } from "@tanstack/react-query";
import addLesson from "./addLesson";

export function useAddLesson(activeTab) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["addLesson", activeTab],
    mutationFn: addLesson,

    onMutate: async (variables) => {
      await queryClient.cancelQueries(["lesson_data", activeTab]);
      const previousData = queryClient.getQueryData(["lesson_data", activeTab]);

      queryClient.setQueryData(["lesson_data", activeTab], (old) => {
        if (!old) return old;

        const newLessonNumber = (old.length || 0) + 1;

        const optimisticLesson = {
          Lesson: newLessonNumber,
          id: `Lesson${newLessonNumber}`,
          optimistic: true,
          levels: [
            {
              id: "Level1",
              title: "This is a template!",
              description:
                "This is a newly added level, feel free to edit this!",
              expReward: 1,
              coinsReward: 1,
              levelOrder: 1,
              stages: [
                {
                  id: "Stage1",
                  title: "A new stage is automatically created",
                  description:
                    "Customize the title and content to guide learners through the initial steps of this level.",
                  optimistic: true,
                },
              ],
            },
          ],
        };

        return [...old, optimisticLesson];
      });

      return { previousData };
    },

    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["lesson_data", activeTab],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["lesson_data", activeTab]);
    },
  });
}
