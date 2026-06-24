import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSpecificProgress } from "../services/deleteSpecificProgress";
import { User } from "../types";

export interface DeleteProgressParams {
  uid: string;
  subject: string;
}

export const useDeleteProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, DeleteProgressParams, { previousQueryData: User[] | undefined }>({
    mutationFn: ({ uid, subject }) => deleteSpecificProgress(uid, subject),

    onMutate: ({ uid, subject }) => {
      queryClient.cancelQueries({ queryKey: ["allUser"] });

      const previousQueryData = queryClient.getQueryData<User[]>(["allUser"]);

      queryClient.setQueryData<User[]>(["allUser"], (old = []) =>
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
      if (context?.previousQueryData) {
        queryClient.setQueryData(["allUser"], context.previousQueryData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUser"] });
    },
  });
};
