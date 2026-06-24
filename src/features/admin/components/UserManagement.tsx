import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import fetchUsers from "@/features/admin/services/fetchUsers";
import { suspendAccount } from "@/features/admin/services/suspendAccount";
import EditUserModal from "@/features/admin/components/user-management/EditUserModal";
import preProfile from "@/assets/Images/profile_handler.png";
import Lottie from "lottie-react";
import loading from "@/assets/Lottie/LoadingDots.json";
import { User } from "../types";

function UserManagement(): React.ReactElement {
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["allUser"],
    queryFn: fetchUsers,
  });

  // Suspend/Activate mutation
  const mutation = useMutation<void, Error, { id: string; toggleDisable: boolean }, { previousUsers: User[] | undefined }>({
    mutationFn: ({ id, toggleDisable }) => suspendAccount(id, toggleDisable),
    onMutate: async ({ id, toggleDisable }) => {
      await queryClient.cancelQueries({ queryKey: ["allUser"] });
      const previousUsers = queryClient.getQueryData<User[]>(["allUser"]);

      queryClient.setQueryData<User[]>(["allUser"], (old = []) =>
        old.map((user) =>
          user.id === id
            ? { ...user, isAccountSuspended: !toggleDisable }
            : user
        )
      );

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["allUser"], context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUser"] });
    },
  });

  return (
    <div className="h-full">
      {/* Header */}
      <div className="border-b border-white h-auto flex flex-col justify-between p-5">
        <div className="flex text-white font-exo justify-between p-5 md:p-10">
          <h1 className="text-2xl sm:text-3xl md:text-[3.2rem] font-bold text-center md:text-left">
            User Management
          </h1>
        </div>
      </div>

      {/* User List */}
      <div className="h-[65%] overflow-y-auto p-3 sm:p-5 scrollbar-custom mt-5">
        {isLoading && (
          <div className="fixed flex items-center justify-center ">
            <Lottie animationData={loading} loop={true} className="w-[60%] h-[60%] sm:w-[40%] sm:h-[40%]" />
          </div>
        )}
        {users.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 text-white p-4 w-full rounded-xl shadow-md hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center gap-5"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-[60px] h-[60px] mx-auto sm:mx-0 rounded-full overflow-hidden border border-white">
                  <img
                    src={user.profileImage || preProfile}
                    alt={`${user.username || "User"}'s profile`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-bold text-base sm:text-lg">
                    Username: {user.username || "Unnamed User"}
                  </p>
                  <p className="text-xs sm:text-sm opacity-80">
                    Email: {user.email || "No Email"}
                  </p>
                  <p className="text-xs mt-2">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        user.isAccountSuspended ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {user.isAccountSuspended ? "Suspended" : "Active"}
                    </span>
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap justify-center sm:justify-end gap-2 mt-3 sm:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 cursor-pointer rounded-md text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700"
                    onClick={() => setOpenModalId(user.id)}
                  >
                    More
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 cursor-pointer rounded-md text-xs sm:text-sm font-semibold transition duration-200 ${
                      user.isAccountSuspended
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-orange-600 hover:bg-orange-800"
                    }`}
                    onClick={() =>
                      mutation.mutate({
                        id: user.id,
                        toggleDisable: !!user.isAccountSuspended,
                      })
                    }
                  >
                    {user.isAccountSuspended ? "Activate" : "Suspend"}
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {openModalId && (
          <EditUserModal
            visibility={!!openModalId}
            closeModal={() => setOpenModalId(null)}
            uid={openModalId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserManagement;
