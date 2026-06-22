import React, { useState } from "react";

// Components
import SettingsHeader from "../components/Settings/SettingsHeader";
import SettingsProfileImage from "../components/Settings/SettingsProfileImage";
import SettingsProfileForm from "../components/Settings/SettingsProfileForm";
import SettingsActions from "../components/Settings/SettingsActions";
import SettingsModals from "../components/Settings/SettingsModals";

// Hooks
import useFetchUserData from '@/services/api/useFetchUserData';
import { useSettingsActions } from "../components/Settings/useSettingsActions";

const Settings: React.FC = () => {
  const { userData, refetch } = useFetchUserData();
  const [showLogoutPopUp, setShowLogoutPopUp] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);

  const { logout, saveDetails, uploadImage, isUploading, uploadProgress } =
    useSettingsActions(userData, refetch);

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col items-center bg-[#06060a] min-h-screen text-slate-200 selection:bg-purple-500/30 font-inter overflow-y-auto overflow-x-hidden">
      <SettingsModals
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        showLogoutPopUp={showLogoutPopUp}
        setShowLogoutPopUp={setShowLogoutPopUp}
        logout={logout}
        showResetPass={showResetPass}
        setShowResetPass={setShowResetPass}
      />

      <div className="w-full max-w-4xl flex flex-col gap-6 pb-10">
        <SettingsHeader />

        <SettingsProfileImage
          userData={userData}
          uploadImage={uploadImage}
          refetch={refetch}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SettingsProfileForm userData={userData} saveDetails={saveDetails} />
          <SettingsActions
            setShowResetPass={setShowResetPass}
            setShowLogoutPopUp={setShowLogoutPopUp}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
