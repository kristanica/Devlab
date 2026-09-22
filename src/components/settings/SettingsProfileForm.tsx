import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoPerson } from "react-icons/io5";

interface SettingsProfileFormProps {
  userData: any;
  saveDetails: (username: string, bio: string) => Promise<void>;
}

const SettingsProfileForm: React.FC<SettingsProfileFormProps> = ({ userData, saveDetails }) => {
  const [newUserName, setUserName] = useState("");
  const [newBio, setBio] = useState("");

  useEffect(() => {
    if (userData) {
      setUserName(userData.username || "");
      setBio(userData.bio || "");
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDetails(newUserName, newBio);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#0d0d12] border border-[#2a2a3c] rounded-2xl p-6 sm:p-8 shadow-xl lg:col-span-2"
    >
      <h3 className="text-white font-exo text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-purple-500 rounded-sm"></span> Profile Details
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IoPerson className="text-slate-500" />
            </div>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={userData?.username || "Enter username..."}
              className="w-full bg-[#161622] border border-[#2a2a3c] text-white rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Biography</label>
          <textarea
            maxLength={150}
            value={newBio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={userData?.bio || "Tell the world about your coding journey..."}
            className="w-full h-32 bg-[#161622] border border-[#2a2a3c] text-white rounded-lg p-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium resize-none"
          />
          <span className="text-slate-500 text-xs self-end">{newBio.length}/150</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-wider text-sm"
          >
            Save Changes
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default SettingsProfileForm;
