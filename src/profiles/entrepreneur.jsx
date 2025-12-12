import { useEffect, useState, useRef } from "react";
import { CiEdit } from "react-icons/ci";
import axiosSecure from "../components/utils/axiosSecure";

import { useAlert } from "../context/AlertContext";
import { useConfirm } from "../context/ConfirmContext";
import { IoIosRocket } from "react-icons/io";

import { useDispatch, useSelector } from "react-redux";
import { loadUserPosts, removePost } from "../redux/slices/postsSlice";

import UserDetails from "./basicDetails/userDetails";
import UserPosts from "./basicDetails/userPosts";

import EntrepreneurDetails from "./entrepreneurDetails/entrepreneurDetails";

import { MdOutlineManageAccounts } from "react-icons/md";
import { RiAdvertisementLine } from "react-icons/ri";

import useLike from "../components/hooks/useLike";
import { getAccessToken } from "../redux/store/tokenManager";

export default function EntrepreneurProfile({ theme }) {
  const isDark = theme === "dark";

  const dispatch = useDispatch();
  const postsRedux = useSelector((state) => state.posts.items);
  const postView = useSelector((state) => state.postView);

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const [posts, setPosts] = useState([]);
  useEffect(() => setPosts(postsRedux), [postsRedux]);

  const [activeTab, setActiveTab] = useState(
    sessionStorage.getItem("entrepreneurActiveTab") || "about"
  );

  const [leftActive, setLeftActive] = useState("user-details");

  const [user, setUser] = useState(null);
  const [entreData, setEntreData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editUser, setEditUser] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // SECTION REFS
  const userRef = useRef(null);
  const entreRef = useRef(null);

  // SCROLL LOCK (same as expert)
  const isUserScrolling = useRef(true);

  const scrollToSection = (ref, key) => {
    setLeftActive(key);
    isUserScrolling.current = false;

    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      isUserScrolling.current = true;
    }, 700);
  };

  useEffect(() => {
    sessionStorage.setItem("entrepreneurActiveTab", activeTab);
  }, [activeTab]);

  // LOAD DATA
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

        const entreRes = await axiosSecure.get("/v1/entrepreneurs/me/profile/");
        setEntreData(entreRes.data);

        dispatch(loadUserPosts(u.username));
      } catch (err) {
        console.log("Load failed", err);
      }

      setLoading(false);
    };

    load();
  }, []);

  // LIKE HANDLER (same as expert)
  const token = getAccessToken();
  const { handleLike } = useLike(setPosts, token, () => {});

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
      showAlert("Failed to update user details", "error");
    }
  };

  // PROFILE PIC UPLOAD
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
      showAlert("Upload failed", "error");
    }
  };

  const handleDelete = async (postId) => {
    showConfirm({
      title: "Delete Post?",
      message: "This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await axiosSecure.delete(`/v1/community/posts/${postId}/`);
          dispatch(removePost(postId));
          showAlert("Post deleted!", "success");
        } catch {
          showAlert("Delete failed!", "error");
        }
      },
    });
  };

  // RESTORE SCROLL
  useEffect(() => {
    if (postView.from === "entrepreneur-profile") {
      if (postView.tab) setActiveTab(postView.tab);

      setTimeout(() => window.scrollTo(0, postView.scroll || 0), 50);
    }
  }, [postView]);

  /* -------------------------------------------------------
     SCROLL SPY — EXACT SAME AS EXPERT VERSION (Option A)
  -------------------------------------------------------- */
  useEffect(() => {
    const NAV_HEIGHT = 60;

    const handleScroll = () => {
      if (!isUserScrolling.current) return;

      const offset = NAV_HEIGHT + 40;

      const sections = [
        { key: "user-details", el: userRef.current },
        { key: "entre-details", el: entreRef.current },
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

  // LOADING
  if (loading || !user || !entreData) {
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
              <div className="w-28 h-28 bg-red-500 text-white rounded-full flex items-center justify-center text-4xl font-bold">
                {user.username.charAt(0).toUpperCase()}
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
                border border-blue-400 bg-blue-400/10 text-blue-500"
              >
                @{user.username}
              </span>

              &nbsp;—&nbsp;

              <span
                className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium border
                border-orange-400 bg-orange-400/10 text-orange-500"
              >
                <IoIosRocket /> &nbsp;Entrepreneur
              </span>
            </p>

            {entreData.verified_by_admin && (
              <div className="mt-1 text-green-500 text-sm font-semibold">
                Verified Entrepreneur
              </div>
            )}
          </div>
        </div>

        {/* MAIN TABS */}
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

        {/* MAIN CONTENT */}
        <div className="mt-6">

          {activeTab === "about" && (
            <div className="flex gap-6">

              {/* LEFT SIDEBAR */}
              <div
                className={`w-1/4 sticky top-24 h-[80vh] pt-5 px-3 rounded-xl shadow overflow-y-auto ${
                  isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
                }`}
              >
                {[
                  {
                    key: "user-details",
                    label: "User Details",
                    icon: <MdOutlineManageAccounts className="text-lg" />,
                    ref: userRef,
                  },
                  {
                    key: "entre-details",
                    label: "Entrepreneur Details",
                    icon: <RiAdvertisementLine className="text-lg" />,
                    ref: entreRef,
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => scrollToSection(item.ref, item.key)}
                    className={`
                      flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg mb-1 transition-all
                      ${
                        leftActive === item.key
                          ? "bg-red-600 text-white shadow"
                          : isDark
                          ? "text-neutral-400 hover:bg-neutral-800"
                          : "text-neutral-600 hover:bg-neutral-200"
                      }
                    `}
                  >
                    {item.icon}
                    {item.label}
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

                <div ref={entreRef} className="scroll-mt-24">
                  <EntrepreneurDetails
                    entreData={entreData}
                    setEntreData={setEntreData}
                    isDark={isDark}
                  />
                </div>

              </div>
            </div>
          )}

          {/* POSTS TAB */}
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
              handleLike={handleLike}
            />
          )}

        </div>
      </div>
    </div>
  );
}
