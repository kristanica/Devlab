

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../Firebase/Firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "../assets/Images/Login-Image.jpg";
import logIcon from "../assets/Images/LoginIcon.png";
import { toast } from "react-toastify";
import { IoPerson, IoLockClosed } from "react-icons/io5";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredentials = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;
      const userDb = doc(db, "Users", user.uid);
      const UserDocs = await getDoc(userDb);

      if (UserDocs.exists() && UserDocs.data().isAdmin) {
        navigate("/Admin");
      } else {
        toast.error("Access denied. Not an admin.", {
          position: "bottom-center",
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
        theme: "colored",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-5xl bg-[#25293B] rounded-3xl shadow-lg shadow-cyan-500 flex flex-col sm:flex-row overflow-hidden">
        {/* Left Panel */}
        <div
          className="hidden sm:flex w-1/2 bg-cover bg-center p-4 items-center justify-center"
          style={{ backgroundImage: `url(${Image})` }}
        >
          <h1 className="font-exo text-4xl lg:text-5xl font-bold text-white drop-shadow-xl">
            DEVLAB
          </h1>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col items-center w-full sm:w-1/2 p-6">
          <img src={logIcon} alt="Admin Icon" className="w-32 h-32 mt-4 mb-2" />

          <form
            className="w-full flex flex-col gap-5 items-center"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* Email */}
            <div className="w-[85%] relative">
              <input
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                className="bg-[#1E212F] text-white w-full h-12 rounded-2xl pl-12 pr-4 border-2 border-gray-700 focus:border-cyan-500 focus:outline-none"
              />
              <IoPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white" />
            </div>

            {/* Password */}
            <div className="w-[85%] relative">
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-[#1E212F] text-white w-full h-12 rounded-2xl pl-12 pr-4 border-2 border-gray-700 focus:border-cyan-500 focus:outline-none"
              />
              <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white" />
            </div>

            <div className="w-[60%] mt-4">
              <button
                type="submit"
                className="bg-[#7F5AF0] w-full text-lg rounded-3xl text-white p-3 font-bold cursor-pointer hover:bg-[#6A4CD4] hover:scale-105 transition-all duration-300 drop-shadow-xl">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;