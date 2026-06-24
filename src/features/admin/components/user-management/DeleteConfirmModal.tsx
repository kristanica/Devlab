import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message?: string;
}

const DeleteConfirmationModal = ({
  isOpen,
  onCancel,
  onConfirm,
  message,
}: DeleteConfirmationModalProps): React.ReactElement => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            className="bg-gray-900 text-white rounded-xl p-6 w-[90%] max-w-md border border-gray-700 shadow-xl"
          >
            <p className="text-center mb-4">{message}</p>
            <div className="flex justify-around mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
