import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSpecificAchievement, DeleteAchievementParams } from "../services/deleteSpecificAchievement";
import { User } from "../types";

export const useDeleteSpecificAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, DeleteAchievementParams, { previousQueryData: User[] | undefined }>({
    mutationFn: ({ uid, category }) =>
      deleteSpecificAchievement({ uid, category }),

    onMutate: async ({ uid, category }) => {
      await queryClient.cancelQueries({ queryKey: ["allUser"] });

      const previousQueryData = queryClient.getQueryData<User[]>(["allUser"]);

      queryClient.setQueryData<User[]>(["allUser"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((user) => {
          if (user.id === uid) {
            return {
              ...user,
              achievements: {
                ...user.achievements,
                [category]: {
                  quantity: 0,
                },
              },
            };
          }
          return user;
        });
      });

      return { previousQueryData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousQueryData) {
        queryClient.setQueryData(["allUser"], context.previousQueryData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUser"] });
    },
  });
};
