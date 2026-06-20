import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../Firebase/Firebase";
import { updateDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const useSettingsActions = (userData: any, refetch: () => void) => {
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const logout = async () => {
    try {
      sessionStorage.removeItem('dashboardLoaded');
      await auth.signOut();
      navigate("/Login");
    } catch (error) {
      console.error(error);
    }
  };

  const saveDetails = async (newUserName: string, newBio: string) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const getUser = doc(db, "Users", user.uid);
    try {
      await updateDoc(getUser, {
        username: newUserName || userData?.username,
        bio: newBio || userData?.bio,
      });
      toast.success("Changes saved successfully!", {
        style: { background: '#0d0d12', color: '#10b981', border: '1px solid #10b98150' }
      });
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes", {
        style: { background: '#0d0d12', color: '#ef4444', border: '1px solid #ef444450' }
      });
    }
  };

  const uploadImage = async (file: File, type: "profile" | "background" = "profile"): Promise<any> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in.");

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!", {
        style: { background: '#0d0d12', color: '#ef4444', border: '1px solid #ef444450' }
      });
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
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setIsUploading(false);
          toast.error("Upload failed. Please try again.", {
            style: { background: '#0d0d12', color: '#ef4444', border: '1px solid #ef444450' }
          });
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
            type === "profile" ? "Profile picture updated!" : "Background image updated!",
            { style: { background: '#0d0d12', color: '#10b981', border: '1px solid #10b98150' } }
          );
          resolve(downloadURL);
        }
      );
    });
  };

  return {
    logout,
    saveDetails,
    uploadImage,
    isUploading,
    uploadProgress
  };
};
