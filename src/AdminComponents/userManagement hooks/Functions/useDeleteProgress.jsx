import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSpecificProgress } from "../Backend Calls/deleteSpecificProgress";// adjust path

export const useDeleteProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, subject }) => deleteSpecificProgress(uid, subject),

    onMutate: ({ uid, subject }) => {
      queryClient.cancelQueries({ queryKey: ["allUser"] });

      const previousQueryData = queryClient.getQueryData(["allUser"]);

      queryClient.setQueryData(["allUser"], (old = []) =>
        old.map((user) => {
          if (user.id === uid) {
            return {
              ...user,
              levelCount: {
                ...user.levelCount,
                [subject]: 0,
              },
            };
          }
          return user;
        })
      );

      return { previousQueryData };
    },

    onError: (_err, _variables, context) => {
      queryClient.setQueryData(["allUser"], context?.previousQueryData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUser"] });
    },
  });
};
