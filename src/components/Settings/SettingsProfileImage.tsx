import React from "react";
import { motion } from "framer-motion";
import { FaCamera, FaMobileAlt } from "react-icons/fa";
import defaultAvatar from "../../assets/Images/profile_handler.png";

interface SettingsProfileImageProps {
  userData: any;
  uploadImage: (file: File, type: "profile" | "background") => Promise<any>;
  refetch: () => void;
}

const SettingsProfileImage: React.FC<SettingsProfileImageProps> = ({ userData, uploadImage, refetch }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full relative rounded-2xl overflow-hidden border border-[#2a2a3c] bg-[#0d0d12] shadow-xl group h-[340px]"
      >
        {/* Background Image Upload */}
        <div className="absolute inset-0 bg-[#161622] group-hover:opacity-80 transition-opacity">
          <img
            src={userData?.backgroundImage}
            alt="Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent" />
        </div>
        
        <label className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
          <FaCamera /> Change Cover
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              if (e.target.files?.[0]) {
                await uploadImage(e.target.files[0], "background");
                await refetch();
              }
            }}
          />
        </label>

        <div className="absolute inset-0 flex flex-col items-center justify-center mt-12 z-10">
          {/* Profile Image Upload */}
          <div className="relative group/avatar">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-[#0d0d12] shadow-2xl relative bg-[#161622]">
              <img
                src={userData?.profileImage || defaultAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                <FaCamera className="text-white text-2xl" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  await uploadImage(e.target.files[0], "profile");
                  await refetch();
                }
              }}
            />
          </div>
          <h2 className="mt-4 font-exo text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
            {userData?.username || "Guest Developer"}
          </h2>
          <div className="mt-1 px-3 py-1 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            Level {userData?.userLevel || 1}
          </div>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.open("https://drive.google.com/file/d/1EQhmkRyEOiV8Vv-zJVzRXMLS6z99tT96/view", "_blank")}
        className="sm:hidden w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm tracking-wide bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
      >
        <FaMobileAlt /> Get Mobile App
      </motion.button>
    </>
  );
};

export default SettingsProfileImage;
