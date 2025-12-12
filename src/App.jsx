// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "./context/AlertContext";

import { fetchUserProfile } from "./redux/slices/userSlice";

import Navbar from "./components/navbar";
import Home from "./pages/home";
import Following from "./pages/following";
import Space from "./pages/space";
import Notification from "./pages/notification";
import Logout from "./components/auth/logout";
import Profile from "./profiles/normalProfile";
import EntrepreneurProfile from "./profiles/entrepreneur";
import ExpertProfile from "./profiles/expertProfile";
import Comments from "./components/posts/comment";
import ExpertWizard from "./profiles/expertWizards/ExpertWizard";
import EntrepreneurWizard from "./profiles/entreprenuerWizard/entreprenuerWizard";
import AdminDashboard from "./admin/adminPages/adminDashboard";
import AdminUsers from "./admin/adminPages/adminUsers";
import AdminPosts from "./admin/adminPages/adminPosts";
import SystemLogs from "./admin/superadminPages/systemLogs";
import AdminLayout from "./admin/adminLayout";
import AdminTags from "./admin/adminPages/adminTags";

function App() {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  /* -----------------------------------------
      FETCH USER PROFILE ONCE (Redux)
  ----------------------------------------- */
  const { data: user, status } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  /* -----------------------------------------
      THEME LOGIC
  ----------------------------------------- */
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      document.body.classList.add("bg-neutral-900", "text-white");
      document.body.classList.remove("bg-white", "text-black");
    } else {
      root.classList.remove("dark");
      document.body.classList.add("bg-white", "text-black");
      document.body.classList.remove("bg-neutral-900", "text-white");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  /* -----------------------------------------
      SEARCH STATE
  ----------------------------------------- */
  const [searchText, setSearchText] = useState("");

  /* -----------------------------------------
      ALERT AFTER LOGIN
  ----------------------------------------- */
  useEffect(() => {
    const alertMessage = localStorage.getItem("pendingAlert");

    if (alertMessage) {
      showAlert(alertMessage, "success");
      localStorage.removeItem("pendingAlert");
    }
  }, [showAlert]);

  /* -----------------------------------------
      NAVBAR VISIBILITY LOGIC
      - while status === "loading" : hide navbar (prevents flicker)
      - after loading:
         - if user == null -> show navbar (logged out)
         - if user.user_type is admin/superadmin -> hide navbar
         - otherwise show navbar
  ----------------------------------------- */
  const shouldShowNavbar = () => {
    // hide while we are fetching profile initially
    if (status === "loading") return false;

    // after loading: if no user -> show navbar (public / logged out)
    if (!user) return true;

    // hide for admin / superadmin
    if (user.user_type === "admin" || user.user_type === "superadmin") return false;

    // show for everyone else
    return true;
  };

  /* -----------------------------------------
      RETURN UI
  ----------------------------------------- */
  return (
    <>
      {/* HIDE NAVBAR FOR ADMIN ROUTES */}
      {shouldShowNavbar() && (
        <Navbar
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onSearch={(text) => setSearchText(text)}
        />
      )}


      <Routes>
        <Route
          path="/"
          element={<Home theme={theme} searchQuery={searchText} />}
        />

        <Route path="/following" element={<Following theme={theme} />} />
        <Route path="/spaces" element={<Space theme={theme} />} />
        <Route path="/notifications" element={<Notification theme={theme} />} />
        <Route path="/profile" element={<Profile theme={theme} />} />
        <Route path="/entrepreneur" element={<EntrepreneurProfile theme={theme} />} />
        <Route path="/upgrade/expert" element={<ExpertWizard theme={theme} />} />
        <Route path="/expert" element={<ExpertProfile theme={theme} />} />
        <Route path="/upgrade/entrepreneur" element={<EntrepreneurWizard theme={theme} />} />

        <Route path="/post/:id/comments" element={<Comments theme={theme} />} />
        <Route path="/logout" element={<Logout />} />

        {/* admin and superadmin routes  */}
        <Route element={<AdminLayout theme={theme} onToggleTheme={toggleTheme} />}>
          <Route path="/admin" element={<AdminDashboard theme={theme} />} />
          <Route path="/superadmin" element={<AdminDashboard theme={theme} />} />
          <Route path="/adminTags" element={<AdminTags theme={theme} />} />
          <Route path="/adminUsers" element={<AdminUsers theme={theme} />} />
          <Route path="/adminPosts" element={<AdminPosts theme={theme} />} />
          <Route path="/system-logs" element={<SystemLogs theme={theme} />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
