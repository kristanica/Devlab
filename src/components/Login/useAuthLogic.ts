import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../Firebase/Firebase";
import { toast } from "react-toastify";
// @ts-ignore
import { validateEmail, validatePassword } from "../Custom Hooks/validations";

export const useAuthLogic = () => {
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showForgot, setShowForgot] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isLoginMode]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await user.reload();

      if (!user.emailVerified) {
        await signOut(auth);
        toast.error("Your email has not been verified yet.", { position: "top-center", theme: "colored" });
        setLoading(false);
        return;
      }

      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data()?.isSuspend) {
        await signOut(auth);
        toast.error("Your account has been suspended.", { position: "top-center", theme: "colored" });
        setLoading(false);
        return;
      }

      const tokenResult = await user.getIdTokenResult(true);
      const role = tokenResult.claims.role;

      if (role === "admin") {
        navigate("/Admin", { replace: true });
      } else {
        navigate("/Main", { replace: true });
      }
    } catch (error: any) {
      const errorMap: Record<string, string> = {
        "auth/invalid-credential": "Invalid User Credentials",
        "auth/user-not-found": "No account found with this email.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/user-disabled": "Your account has been suspended.",
      };
      const message = errorMap[error.code] || "Login failed. Please try again.";
      toast.error(message, { position: "top-center", theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center", theme: "colored" });
      return;
    }

    const [emailStatus, emailMsg] = validateEmail(email);
    if (emailStatus === "error") {
      toast.error(emailMsg, { position: "top-center", theme: "colored" });
      return;
    }

    const [passwordStatus, passwordMsg] = validatePassword(password);
    if (passwordStatus === "error") {
      toast.error(passwordMsg, { position: "top-center", theme: "colored" });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        await sendEmailVerification(user);
        toast.success("Verification email sent! Please check your inbox.", { position: "top-center", theme: "colored" });

        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          username: username,
          exp: 0,
          userLevel: 1,
          coins: 0,
          bio: "",
          lastOpenedLevel: {},
        });

        const subjects = ["Html", "Css", "JavaScript", "Database"];
        for (const subject of subjects) {
          await setDoc(doc(db, "Users", user.uid, "Progress", subject), { isActive: true });
          await setDoc(doc(db, "Users", user.uid, "Progress", subject, "Lessons", "Lesson1"), { isActive: true });
          await setDoc(doc(db, "Users", user.uid, "Progress", subject, "Lessons", "Lesson1", "Levels", "Level1"), {
            isActive: true,
            isCompleted: false,
            isRewardClaimed: false,
          });
          await setDoc(doc(db, "Users", user.uid, "Progress", subject, "Lessons", "Lesson1", "Levels", "Level1", "Stages", "Stage1"), {
            isActive: true,
            isCompleted: true,
          });
        }

        await signOut(auth);
        toast.success("Registered successfully! Please verify your email before logging in.", { position: "top-center", theme: "colored" });
        setIsLoginMode(true);
      }
    } catch (error: any) {
      toast.error(error.message, { position: "bottom-center", theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoginMode, setIsLoginMode,
    email, setEmail,
    password, setPassword,
    loading, setLoading,
    showPassword, setShowPassword,
    rememberMe, setRememberMe,
    showForgot, setShowForgot,
    username, setUsername,
    confirmPassword, setConfirmPassword,
    showConfirmPassword, setShowConfirmPassword,
    showTooltip, setShowTooltip,
    handleLogin, handleRegister
  };
};
