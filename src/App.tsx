import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
// FIREBASE
import { auth } from "./services/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
// COMPONENTS
import LandingPage from "./features/landing/pages/LandingPage";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./features/dashboard/pages/DashboardPage";
import Achievements from "./features/achievements/pages/AchievementsPage";
import ShopPage from "./features/shop/pages/ShopPage";
import Settings from "./pages/Settings";
import CodePlayground from "./pages/CodePlayground";
import DataqueriesPlayground from "./pages/DataqueriesPlayground";
// ADMIN
import AdminLayout from "@/features/admin/layouts/AdminLayout";
import ContentManagement from "@/features/admin/components/ContentManagement";
import UserManagement from "@/features/admin/components/UserManagement";
// DISPLAY LESSON/LEVELS PAGE
import HtmlLessons from "./features/lessons/pages/HtmlLessons";
import CssLessons from "./features/lessons/pages/CssLessons";
import JavaScriptLessons from "./features/lessons/pages/JavaScriptLessons";
import DataLessons from "./features/lessons/pages/DataLessons";

// GAME MODES
import GameModeRouter from "./features/gamemodes/components/GameModeRouter";
// Utils
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FullscreenLoader from "./components/FullScreenLoader";
// @ts-ignore
import { loadSounds } from "./utils/DevlabSoundHandler";
// @ts-ignore
import NotFound from "./pages/NotFound";
import AuthActionHandler from "./features/auth/components/AuthActionHandler";

const App = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setAdmin] = useState<boolean>(false);

  useEffect(() => {
    loadSounds();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Block unverified
        if (!currentUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          setAdmin(false);
          setLoading(false);
          return;
        }

        const token = await currentUser.getIdTokenResult(true);
        const role = token.claims.role;

        setUser(currentUser);
        setAdmin(role === "admin");
        console.log("[App] Logged in successfully with uid:", currentUser.uid);
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const isLoggedIn = Boolean(user);

  if (loading) return null;

  return (
    <>
      <FullscreenLoader />
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              !isLoggedIn ? (
                <LandingPage />
              ) : isAdmin ? (
                <Navigate to="/Admin" replace />
              ) : (
                <Navigate to="/Main" replace />
              )
            }
          />

          <Route
            path="/Login"
            element={
              !isLoggedIn ? (
                <Login />
              ) : isAdmin ? (
                <Navigate to="/Admin" replace />
              ) : (
                <Navigate to="/Main" replace />
              )
            }
          />

          <Route path="/handle-action" element={<AuthActionHandler />} />

          {/* Protected Routes */}
          <Route
            path="/Main"
            element={isLoggedIn ? <Layout /> : <Navigate to="/Login" replace />}
          >
            <Route index element={<Dashboard />} />
            <Route path="Lessons/Html" element={<HtmlLessons />} />
            <Route path="Lessons/Css" element={<CssLessons />} />
            <Route path="Lessons/JavaScript" element={<JavaScriptLessons />} />
            <Route path="Lessons/Database" element={<DataLessons />} />

            <Route path="Achievements" element={<Achievements />} />
            <Route path="Shop" element={<ShopPage />} />
            <Route path="Settings" element={<Settings />} />
          </Route>

          <Route
            path="/Main/Lessons/:subject/:lessonId/:levelId/:stageId/:gamemodeId"
            element={
              isLoggedIn ? <GameModeRouter /> : <Navigate to="/Login" replace />
            }
          />

          <Route
            path="/codingPlay"
            element={
              isLoggedIn ? <CodePlayground /> : <Navigate to="/Login" replace />
            }
          />
          <Route
            path="/dataPlayground"
            element={
              isLoggedIn ? (
                <DataqueriesPlayground />
              ) : (
                <Navigate to="/Login" replace />
              )
            }
          />

          {/* Admin */}
          <Route
            path="/Admin"
            element={
              isLoggedIn && isAdmin ? (
                <AdminLayout />
              ) : isLoggedIn && !isAdmin ? (
                <Navigate to="/Main" replace />
              ) : (
                <Navigate to="/Login" replace />
              )
            }
          >
            <Route index element={<Navigate to="ContentManagement" />} />
            <Route path="ContentManagement" element={<ContentManagement />} />
            <Route path="UserManagement" element={<UserManagement />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
        <Toaster position="top-center" reverseOrder={false} />
      </QueryClientProvider>
    </>
  );
};

export default App;
