import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import fetchUsers from "./userManagement hooks/Backend Calls/fetchUsers";
import { suspendAccount } from "./userManagement hooks/Backend Calls/suspendAccount";
import EditUserModal from "./userManagement hooks/userManagement Components/EditUserModal";
import preProfile from "../assets/Images/profile_handler.png";
import Lottie from "lottie-react";
import loading from "../assets/Lottie/LoadingDots.json"

function UserManagement() {
  const [openUserId, setOpenUserId] = useState(null);
  const [openModalId, setOpenModalId] = useState(null);

  const queryClient = useQueryClient();

  const subjects = ["Html", "Css", "JavaScript", "Database"];

  // Fetch all users
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["allUser"],
    queryFn: fetchUsers,
  });

  // Suspend/Activate mutation
  const mutation = useMutation({
    mutationFn: ({ id, toggleDisable }) => suspendAccount(id, toggleDisable),
    onMutate: async ({ id, toggleDisable }) => {
      await queryClient.cancelQueries({ queryKey: ["allUser"] });
      const previousUsers = queryClient.getQueryData(["allUser"]);

      queryClient.setQueryData(["allUser"], (old = []) =>
        old.map((user) =>
          user.id === id
            ? { ...user, isAccountSuspended: !toggleDisable }
            : user
        )
      );

      return { previousUsers };
    },
    onError: (context) => {
      queryClient.setQueryData(["allUser"], context.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUser"] });
    },
  });

  const currentUser = users.find((u) => u.id === openUserId);
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
          {isLoading && 
        <div className="fixed flex items-center justify-center ">
          <Lottie animationData={loading} loop={true} className="w-[60%] h-[60%] sm:w-[40%] sm:h-[40%]" />
        </div>
        }
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
                      toggleDisable: user.isAccountSuspended,
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

    {/* Progress Popup */}
    <AnimatePresence>
      {openUserId && currentUser && (
        <motion.div
          key="progress-popup"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-[90%] md:w-[70%] lg:w-[60%] h-[60%] bg-gray-900 text-white z-50 p-4 sm:p-6 shadow-xl rounded-t-2xl overflow-y-auto scrollbar-custom"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold">
              {currentUser.username || "User"}'s Progress
            </h2>
            <button
              onClick={() => setOpenUserId(null)}
              className="text-white text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {subjects.map((subject) => (
            <SubjectProgress
              key={subject}
              subject={subject}
              currentUser={currentUser}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Edit User Modal */}
    <AnimatePresence>
      {openModalId && (
        <EditUserModal
          visibility={!!openModalId}
          closeModal={() => setOpenModalId(null)}
          uid={openModalId}
          activeLevel={users.reduce(
            (acc, u) => (u.id === openModalId ? u.levelCount : acc),
            {}
          )}
          deleteProgress={{
            mutate: ({ uid, subject }) =>
              console.log("Delete progress", uid, subject),
          }}
          editUser={{
            mutate: ({ uid, state }) => console.log("Edit user", uid, state),
          }}
        />
      )}
    </AnimatePresence>


  </div>
);

}

export default UserManagement;

