import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editUser } from "../Backend Calls/editUser";

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, state }) => editUser({ uid, state }),
    onMutate: ({ uid, state }) => {
      const previousUsers = queryClient.getQueryData(["allUser"]);
      queryClient.setQueryData(["allUser"], (old = []) =>
        old.map((user) => (user.id === uid ? { ...user, ...state } : user))
      );
      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(["allUser"], context?.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["allUser"]);
    },
  });
};