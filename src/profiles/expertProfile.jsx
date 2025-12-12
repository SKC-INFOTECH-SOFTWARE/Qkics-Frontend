import { useEffect, useState, useRef } from "react";
import { CiEdit } from "react-icons/ci";
import axiosSecure from "../components/utils/axiosSecure";
import { useAlert } from "../context/AlertContext";
import { useConfirm } from "../context/ConfirmContext";
import { FaGraduationCap } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { loadUserPosts, removePost } from "../redux/slices/postsSlice";

// Shared Components
import UserDetails from "./basicDetails/userDetails";
import UserPosts from "./basicDetails/userPosts";

// Expert Components
import ExpertDetails from "./expertDetails/expertDetails";
import ExperiencePage from "./expertDetails/expertExperience";
import EducationPage from "./expertDetails/expertEducation";
import CertificationPage from "./expertDetails/expertCertification";
import HonorsPage from "./expertDetails/expertHonors";

// Sidebar Icons
import { MdOutlineManageAccounts } from "react-icons/md";
import { HiOutlineIdentification } from "react-icons/hi";
import { MdWorkOutline } from "react-icons/md";
import {
  PiBookOpenTextLight,
  PiCertificateLight,
  PiMedalLight,
} from "react-icons/pi";

export default function ExpertProfile({ theme }) {
  const isDark = theme === "dark";
  const dispatch = useDispatch();
  const postView = useSelector((state) => state.postView);

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  /* --------------------------
      POSTS LOCAL STATE
  --------------------------- */
  const postsState = useSelector((state) => state.posts.items);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setPosts(postsState);
  }, [postsState]);

  /* -------------------------- */
  const [activeTab, setActiveTab] = useState(
    sessionStorage.getItem("expertActiveTab") || "about"
  );

  const [leftActive, setLeftActive] = useState("user-details");

  const [user, setUser] = useState(null);
  const [expertData, setExpertData] = useState(null);

  const [editUser, setEditUser] = useState(false);
  const [editExp, setEditExp] = useState(false);

  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ---------- SECTION REFS ---------- */
  const userRef = useRef(null);
  const expertRef = useRef(null);
  const experienceRef = useRef(null);
  const educationRef = useRef(null);
  const certRef = useRef(null);
  const honorRef = useRef(null);

  const scrollToSection = (ref, key) => {
    setLeftActive(key); // immediately highlight
    isUserScrolling.current = false; // disable scroll spy while animating

    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Re-enable scroll spy AFTER smooth scroll finishes
    setTimeout(() => {
      isUserScrolling.current = true;
    }, 700);
  };

  const isUserScrolling = useRef(true);

  /* ---------- SAVE ACTIVE TAB ---------- */
  useEffect(() => {
    sessionStorage.setItem("expertActiveTab", activeTab);
  }, [activeTab]);

  /* ---------- LOAD USER + EXPERT + POSTS ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await axiosSecure.get("/v1/auth/me/");
        const u = userRes.data;

        setUser(u);
        setEditData({
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          email: u.email || "",
          phone: u.phone || "",
        });

        const expRes = await axiosSecure.get("/v1/experts/me/profile/");
        setExpertData(expRes.data);

        dispatch(loadUserPosts(u.username));
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    load();
  }, []);

  /* ---------- UPDATE USER ---------- */
  const handleSaveUser = async () => {
    try {
      const res = await axiosSecure.patch("/v1/auth/me/update/", {
        first_name: editData.first_name,
        last_name: editData.last_name,
        phone: editData.phone,
      });

      setUser(res.data.user);
      setEditUser(false);
      showAlert("User details updated!", "success");
    } catch {
      showAlert("Update failed!", "error");
    }
  };

  /* ---------- UPDATE EXPERT PROFILE ---------- */
  const handleSaveExpert = async () => {
    try {
      const res = await axiosSecure.patch("/v1/experts/me/profile/", {
        headline: expertData.headline,
        primary_expertise: expertData.primary_expertise,
        other_expertise: expertData.other_expertise,
        hourly_rate: expertData.hourly_rate,
      });

      setExpertData(res.data);
      setEditExp(false);
      showAlert("Expert profile updated!", "success");
    } catch {
      showAlert("Failed!", "error");
    }
  };

  /* ---------- PROFILE PICTURE UPLOAD ---------- */
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const res = await axiosSecure.patch("/v1/auth/me/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.user);
      showAlert("Profile picture updated!", "success");
    } catch {
      showAlert("Upload failed!", "error");
    }
  };

  /* ---------- DELETE POST ---------- */
  const handleDelete = async (postId) => {
    showConfirm({
      title: "Delete Post?",
      message: "Are you sure?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await axiosSecure.delete(`/v1/community/posts/${postId}/`);
          dispatch(removePost(postId));
          showAlert("Post deleted successfully!", "success");
        } catch {
          showAlert("Delete failed!", "error");
        }
      },
    });
  };

  /* ---------- SCROLL SPY (non-flicker version) ---------- */
  useEffect(() => {
    const NAV_HEIGHT = 60;

    const handleScroll = () => {
      if (!isUserScrolling.current) return;

      const offset = NAV_HEIGHT + 40;

      const sections = [
        { key: "user-details", el: userRef.current },
        { key: "expert-details", el: expertRef.current },
        { key: "experience", el: experienceRef.current },
        { key: "education", el: educationRef.current },
        { key: "certification", el: certRef.current },
        { key: "honors", el: honorRef.current },
      ];

      let closest = "user-details";
      let minDistance = Infinity;

      sections.forEach((sec) => {
        if (!sec.el) return;

        const rect = sec.el.getBoundingClientRect();
        const distance = Math.abs(rect.top - offset);

        if (distance < minDistance) {
          minDistance = distance;
          closest = sec.key;
        }
      });

      setLeftActive(closest);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------- RESTORE SCROLL ---------- */
  useEffect(() => {
    if (postView.from === "expert-profile") {
      if (postView.tab) setActiveTab(postView.tab);
      setTimeout(() => window.scrollTo(0, postView.scroll || 0), 50);
    }
  }, [postView]);

  /* ---------- LOADING ---------- */
  if (loading || !user || !expertData) {
    return (
      <div className={`mt-20 text-center ${isDark ? "text-white" : "text-black"}`}>
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-20 px-4 ${
        isDark ? "bg-neutral-950 text-white" : "bg-neutral-100 text-black"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div
          className={`p-6 rounded-xl shadow flex gap-6 items-center mb-6 ${
            isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
          }`}
        >
          <div className="relative w-28 h-28">
            {user.profile_picture ? (
              <img
                src={`${user.profile_picture}?t=${Date.now()}`}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <div className="w-28 h-28 bg-red-600 text-white rounded-full flex items-center justify-center text-5xl font-bold">
                {user.username.charAt(0)}
              </div>
            )}

            <label className="absolute bottom-1 right-1 bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-black">
              <CiEdit />
              <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
            </label>
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              {user.first_name || user.last_name
                ? `${user.first_name} ${user.last_name}`

: user.username}
            </h1>

            <p className="text-neutral-400 mt-2 mb-2">
              <span
                className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium
                border transition-all border-blue-400 bg-blue-400/10 text-blue-500"
              >
                @{user.username}
              </span>

              &nbsp;—&nbsp;

              <span
                className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium
                border transition-all border-purple-400 bg-purple-400/10 text-purple-500"
              >
                <FaGraduationCap /> &nbsp;Expert
              </span>
            </p>

            {expertData.verified_by_admin && (
              <div className="mt-1 text-green-500 text-sm font-semibold">Verified Expert</div>
            )}
          </div>
        </div>

        {/* TOP NAV TABS */}
        <div className="flex justify-center gap-10 border-b pb-2">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-2 text-lg font-medium ${
              activeTab === "about"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-neutral-500"
            }`}
          >
            About
          </button>

          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-2 text-lg font-medium ${
              activeTab === "posts"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-neutral-500"
            }`}
          >
            Posts
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-6">
          {/* ABOUT SECTION */}
          {activeTab === "about" && (
            <div className="flex gap-6">
              {/* LEFT SIDEBAR */}
              <div
                className={`w-1/4 sticky top-24 h-[80vh] pt-5 px-3 rounded-xl shadow overflow-y-auto ${
                  isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
                }`}
              >
                {[
                  { key: "user-details", label: "User Details", icon: <MdOutlineManageAccounts />, ref: userRef },
                  { key: "expert-details", label: "Expert Details", icon: <HiOutlineIdentification />, ref: expertRef },
                  { key: "experience", label: "Experience", icon: <MdWorkOutline />, ref: experienceRef },
                  { key: "education", label: "Education", icon: <PiBookOpenTextLight />, ref: educationRef },
                  { key: "certification", label: "Certification", icon: <PiCertificateLight />, ref: certRef },
                  { key: "honors", label: "Honors & Awards", icon: <PiMedalLight />, ref: honorRef },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => scrollToSection(item.ref, item.key)}
                    className={`flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg mb-1 transition-all
                      ${
                        leftActive === item.key
                          ? "bg-red-600 text-white shadow"
                          : isDark
                          ? "text-neutral-400 hover:bg-neutral-800"
                          : "text-neutral-600 hover:bg-neutral-200"
                      }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>

              {/* RIGHT CONTENT */}
              <div className="w-3/4 min-w-0 space-y-10">
                <div ref={userRef} className="scroll-mt-24">
                  <UserDetails
                    user={user}
                    editMode={editUser}
                    setEditMode={setEditUser}
                    editData={editData}
                    setEditData={setEditData}
                    handleSave={handleSaveUser}
                    isDark={isDark}
                  />
                </div>

                <div ref={expertRef} className="scroll-mt-24">
                  <ExpertDetails
                    expertData={expertData}
                    setExpertData={setExpertData}
                    editExp={editExp}
                    setEditExp={setEditExp}
                    handleSaveExpert={handleSaveExpert}
                    isDark={isDark}
                  />
                </div>

                <div ref={experienceRef} className="scroll-mt-24">
                  <ExperiencePage
                    experiences={expertData.experiences || []}
                    setExpertData={setExpertData}
                    isDark={isDark}
                  />
                </div>

                <div ref={educationRef} className="scroll-mt-24">
                  <EducationPage
                    education={expertData.educations || []}
                    setExpertData={setExpertData}
                    isDark={isDark}
                  />
                </div>

                <div ref={certRef} className="scroll-mt-24">
                  <CertificationPage
                    certifications={expertData.certifications || []}
                    setExpertData={setExpertData}
                    isDark={isDark}
                  />
                </div>

                <div ref={honorRef} className="scroll-mt-24">
                  <HonorsPage
                    honors_awards={expertData.honors_awards || []}
                    setExpertData={setExpertData}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          )}

          {/* POSTS SECTION */}
          {activeTab === "posts" && (
            <UserPosts
              posts={posts}
              setPosts={setPosts}
              isDark={isDark}
              openCreate={openCreate}
              setOpenCreate={setOpenCreate}
              editingPost={editingPost}
              setEditingPost={setEditingPost}
              handleDelete={handleDelete}
              setShowLogin={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
