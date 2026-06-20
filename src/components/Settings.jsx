// Uis
import { IoPerson } from "react-icons/io5";
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import LogoutAnimation from "../assets/Lottie/SadSignout.json";
import defaultAvatar from '../assets/Images/profile_handler.png';
// Firebase
import { auth, db, storage } from "../Firebase/Firebase";
import { updateDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// Utils
import {  useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// Components
import AdminLogin from "../assets/Lottie/AdminLogin.json";
import ResetPassword from "./ResetPassword";
// Data
import useFetchUserData from "./BackEnd_Data/useFetchUserData";

function Settings() {
  const { userData, refetch } = useFetchUserData();

  const [showLogoutPopUp, setShowLogoutPopUp] = useState(false);
  const [showAdminPopup, setAdminPopup] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const navigate = useNavigate();

  // Upload States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Logout
  const logout = async () => {
    try {
      sessionStorage.removeItem('dashboardLoaded');
      await auth.signOut();
      navigate("/Login");
    } catch (error) {
      console.log(error);
    }
  };


  // Username & Bio
  const [newUserName, setUserName] = useState("");
  const [newBio, setBio] = useState("");
  useEffect(() => {
    if (userData) {
      setUserName(userData.username || "");
      setBio(userData.bio || "");
    }
  }, [userData]);

  // Save Button
  const saveDetails = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const getUser = doc(db, "Users", user.uid);
    toast.success("Save Changes", {
      position: "top-center",
      theme: "colored",
    });
    try {
      await updateDoc(getUser, {
        username: newUserName || userData.username,
        bio: newBio || userData.bio,
      });
    } catch (error) {
      console.log(error);
    }
  };

  //  Upload Image WITH Progress
const uploadImage = async (file, type = "profile") => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in.");

  //  Validate file type
  if (!file.type.startsWith("image/")) {
    toast.error("Only image files are allowed!");
    return;
  }

  const fileRef = ref(storage, `userProfiles/${user.uid}/${type}.jpg`);
  const uploadTask = uploadBytesResumable(fileRef, file);

  setIsUploading(true);
  setUploadProgress(0);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        toast.error("Upload failed. Please try again.");
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        await setDoc(
          doc(db, "Users", user.uid),
          { [`${type}Image`]: downloadURL },
          { merge: true }
        );

        setIsUploading(false);
        toast.success(
          type === "profile"
            ? "Profile picture updated successfully!"
            : "Background image updated successfully!",
          { position: "top-center", theme: "colored" }
        );

        resolve(downloadURL);
      }
    );
  });
};



  return (
    <>
      {/*  Upload Progress Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1E212F] p-6 rounded-2xl w-[80%] sm:w-[40%] text-center">
            <h1 className="text-white font-exo mb-4">Uploading...</h1>

            <div className="w-full bg-gray-700 h-3 rounded-xl overflow-hidden">
              <div
                className="bg-[#7F5AF0] h-full transition-all duration-100"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            <p className="text-white mt-3">{Math.round(uploadProgress)}%</p>
          </div>
        </div>
      )}

      <div className="bg-[#111827] flex flex-col h-[95%] items-center gap-5 p-5 mx-auto mt-5 rounded-3xl border-2 shadow-2xl shadow-black w-full max-w-[600px] sm:max-w-[700px] md:max-w-[900px] relative">
        
        {/* Profile Image */}
        <motion.div
          className="w-[40%] sm:w-[30%] h-[25%] rounded-full overflow-hidden border border-gray-600 cursor-pointer relative"
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <img
            src={userData?.profileImage || defaultAvatar}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={async (e) => {
              if (e.target.files[0]) {
                await uploadImage(e.target.files[0], "profile");
                await refetch();
              }
            }}
          />
        </motion.div>

        {/* Background Image */}
        <motion.div
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-[80%] sm:w-[70%] h-[10%] rounded-3xl overflow-hidden border border-gray-600 relative"
        >
          <img
            src={userData?.backgroundImage || defaultAvatar}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={async (e) => {
              if (e.target.files[0]) {
                await uploadImage(e.target.files[0], "background");
                await refetch();
              }
            }}
          />
        </motion.div>

        {/* Form */}
        <form
          onSubmit={saveDetails}
          className="w-full sm:w-[80%] md:w-[55%] flex flex-col gap-3 p-1"
        >
          <label className="text-white font-exo font-light">Username</label>
          <div className="relative w-full h-[45px] flex items-center">
            <input
              type="text"
              placeholder={userData ? userData.username : "Loading..."}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full h-full text-white bg-[#1E212F] rounded-2xl p-2 pl-10"
            />
            <IoPerson className="absolute text-white text-2xl ml-2" />
          </div>

          <label className="text-white font-exo font-light">Bio</label>
          <div className="w-full h-[80px] sm:h-[100px]">
            <textarea
              maxLength="50"
              placeholder={userData ? userData.bio : "Loading..."}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-full text-white bg-[#1E212F] rounded-2xl p-2 resize-none"
            ></textarea>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ bounceDamping: 100 }}
            type="submit"
            className="bg-[#7F5AF0] w-full sm:w-[80%] md:w-[60%] font-exo p-2 m-auto rounded-4xl text-[1rem] font-bold text-white hover:bg-[#6A4CD4] hover:drop-shadow-[0_0_6px_rgba(188,168,255,0.4)] cursor-pointer"
          >
            Save Changes
          </motion.button>
        </form>

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ bounceDamping: 100 }}
          className="bg-[#FF6166] p-3 w-full sm:w-[60%] md:w-[43%] rounded-3xl font-exo font-bold text-white mt-1.5 hover:bg-[#E04C52] hover:drop-shadow-[0_0_6px_rgba(255,99,71,0.4)] cursor-pointer"
          onClick={() => setTimeout(() => setShowLogoutPopUp(true), 300)}>
          Logout
        </motion.button>

        <button
          className="text-white text-sm hover:underline cursor-pointer"
          onClick={() => setShowResetPass(true)}>
          Reset Password
        </button>

{/* Download Mobile App Button - Right Side */}
<div className="w-full flex justify-end pr-3 relative">
  <motion.button
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    transition={{ bounceDamping: 100 }}
    className="bg-[#7F5AF0] px-5 py-2 rounded-3xl font-exo font-bold text-white hover:bg-[#6A4CD4] hover:drop-shadow-[0_0_6px_rgba(188,168,255,0.4)] cursor-pointer underline"
    onClick={() => window.open("https://drive.google.com/file/d/1EQhmkRyEOiV8Vv-zJVzRXMLS6z99tT96/view?fbclid=IwY2xjawN0KAtleHRuA2FlbQIxMABicmlkETFwZk5qNVVjMG1lT2ZweHhOAR4n5O0TdGXdMvEQBZy9P5iNOJuW4pr797V0NQgL6wm2Hm9OfUtsuX8dTq4V0g_aem_2fjLapyiNy1egZ2Q0uE1Zg", "_blank")}>
    Download Mobile App
  </motion.button>
</div>
      </div>



      {/* Logout Popup */}
      <AnimatePresence initial={false}>
        {showLogoutPopUp && (
          <div className="fixed inset-0 flex bg-black/80 backdrop-blur-sm items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="bg-[#1E212F] text-white p-6 rounded-2xl text-center shadow-lg w-[80%] sm:w-[40%] md:w-[25%] flex flex-col items-center">
              <h2 className="text-xl font-bold font-exo">Confirm Logout</h2>
              <Lottie
                animationData={LogoutAnimation}
                loop
                className="w-[40%] h-[50%] mt-4"/>
              <p className="mb-6 font-exo">Are you sure you want to log out?</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ bounceDamping: 100 }}
                  onClick={logout}
                  className="bg-[#FF6166] p-3 w-full sm:w-[40%] rounded-3xl font-exo font-bold text-white hover:drop-shadow-[0_0_6px_rgba(255,99,71,0.4)] cursor-pointer">
                  Yes, Logout
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ bounceDamping: 100 }}
                  onClick={() => setTimeout(() => setShowLogoutPopUp(false), 200)}
                  className="bg-gray-500 p-3 w-full sm:w-[40%] rounded-3xl font-exo font-bold text-white hover:drop-shadow-[0_0_6px_rgba(128,128,128,0.4)] cursor-pointer">
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Reset Password */}
      {showResetPass && <ResetPassword onClose={() => setShowResetPass(false)} />}
 
    </>
  );
}

export default Settings;
