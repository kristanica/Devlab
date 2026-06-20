import { deleteSpecificAchievement } from "../Backend Calls/deleteSpecificAchievement";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteSpecificAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, category }) =>
      deleteSpecificAchievement({ uid, category }),

    onMutate: async ({ uid, category }) => {
      await queryClient.cancelQueries({ queryKey: ["allUser"] });

      const previousQueryData = queryClient.getQueryData(["allUser"]);

      queryClient.setQueryData(["allUser"], (oldData) => {
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
