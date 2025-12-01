// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { HiPencilAlt, HiTrash } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";

import axiosSecure from "../components/utils/axiosSecure";
import useLike from "../components/hooks/useLike";

import CreatePostModal from "../components/posts/create_post";
import LoginModal from "../components/auth/login";
import SignupModal from "../components/auth/register";

function Profile({ theme }) {
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const bg = isDark ? "bg-[#0f0f0f]" : "bg-[#f5f5f5]";
  const cardBg = isDark ? "bg-[#2c2c2c]" : "bg-white";
  const hoverBg = isDark ? "hover:bg-[#3a3a3a]" : "hover:bg-[#f0f0f0]";
  const text = isDark ? "text-[#eaeaea]" : "text-[#111111]";
  const borderColor = isDark ? "border-white/15" : "border-black/10";

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [menuOpen, setMenuOpen] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

  const { handleLike } = useLike(setPosts, () => setShowLogin(true));

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  /* -------------------------
      LOAD PROFILE + POSTS
  --------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // GET LOGGED-IN USER
        const res = await axiosSecure.get("/v1/auth/me/");
        const user = res.data;

        setProfileUser(user);

        // Initialize editData correctly
        setEditData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });

        // GET USER POSTS
        const postsRes = await axiosSecure.get(
          `/v1/community/posts/user/${user.username}/`
        );
        setPosts(postsRes.data);
      } catch (err) {
        console.log("Profile load error:", err);
      }
    };

    fetchData();
  }, []);

  /* -------------------------
        SAVE PROFILE
  --------------------------- */
  const handleUpdateProfile = async () => {
    try {
      const res = await axiosSecure.patch("/v1/auth/me/update/", {
        first_name: editData.first_name,
        last_name: editData.last_name,
        phone: editData.phone,
      });

      const updatedUser = res.data.user;
      setProfileUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update form fields also
      setEditData({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      setEditMode(false);
      alert("Profile Updated Successfully!");
    } catch (err) {
      console.log("Profile update error:", err);
      alert("Update failed!");
    }
  };

  const handleProfilePicUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profile_picture", file);

  try {
    const res = await axiosSecure.patch("/v1/auth/me/update/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const updatedUser = res.data.user;
    setProfileUser(updatedUser);

    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Profile picture updated!");

    // Reload after short delay
    setTimeout(() => {
      window.location.reload();
    }, 300);

  } catch (err) {
    console.log("Profile pic upload error:", err);
    alert("Upload failed!");
  }
};


  /* -------------------------
        DELETE POST
  --------------------------- */
  const handleDelete = async (postId) => {
    if (!window.confirm("Do you really want to delete this post?")) return;

    try {
      await axiosSecure.delete(`/v1/community/posts/${postId}/`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.log("Delete error:", err);
      alert("Delete failed!");
    }
  };

  /* -------------------------
    OPEN COMMENTS PAGE
  --------------------------- */
  const openComments = (postId) => {
    const token = localStorage.getItem("access");
    if (!token) return setShowLogin(true);

    navigate(`/post/${postId}/comments`);
  };

  if (!profileUser) {
    return (
      <div className={`mt-20 text-center ${isDark ? "text-white" : "text-black"}`}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} pb-10`}>
      <div className="pt-10 max-w-6xl mx-auto px-4">

        {/* HEADER */}
        <div
          className={`p-6 rounded-xl shadow flex gap-6 items-center mb-6
          ${isDark ? "bg-neutral-900 text-white" : "bg-white text-black"}`}
        >
          <div className="relative w-28 h-28">

  {/* PROFILE IMAGE OR INITIAL */}
  {profileUser.profile_picture ? (
    <img
      src={profileUser.profile_picture}
      alt="Profile"
      className="w-28 h-28 rounded-full object-cover"
    />
  ) : (
    <div className="w-28 h-28 rounded-full bg-red-600 text-white flex items-center justify-center text-5xl font-bold">
      {profileUser.first_name
        ? profileUser.first_name.charAt(0).toUpperCase()
        : profileUser.username.charAt(0).toUpperCase()}
    </div>
  )}

  {/* EDIT ICON */}
  <label className="absolute bottom-1 right-1 bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-black">
    <CiEdit />
    <input
      type="file"
      accept="image/*"
      onChange={handleProfilePicUpload}
      className="hidden"
    />
  </label>
</div>


          <div>
            <h1 className="text-3xl font-bold">
              {profileUser.first_name || profileUser.last_name
                ? `${profileUser.first_name} ${profileUser.last_name}`
                : profileUser.username}
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              @{profileUser.username} - {profileUser.user_type}
            </p>
          </div>

          <div className="ml-auto">
            {/* Removed Edit button from here */}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT — USER DETAILS */}
          {/* LEFT — USER DETAILS */}
<div
  className={`px-6 pt-6 pb-3 rounded-xl shadow self-start
    ${isDark ? "bg-neutral-900 text-white" : "bg-white text-black"}`}
>
  {/* EDIT BUTTON */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold">User Details</h2>

    {!editMode ? (
      <button
        onClick={() => setEditMode(true)}
        className="px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
      >
        Edit
      </button>
    ) : (
      <div className="flex gap-2">
        <button
          onClick={handleUpdateProfile}
          className="px-4 py-1.5 rounded-md bg-green-500 text-white"
        >
          Save
        </button>

        <button
          onClick={() => {
            setEditData({
              first_name: profileUser.first_name || "",
              last_name: profileUser.last_name || "",
              email: profileUser.email || "",
              phone: profileUser.phone || "",
            });
            setEditMode(false);
          }}
          className="px-4 py-1.5 rounded-md bg-neutral-600 text-white"
        >
          Cancel
        </button>
      </div>
    )}
  </div>

  {/* FIELDS */}
  <div className="flex flex-col gap-4">

    {/* FIRST NAME */}
    <div>
      <label className="text-sm opacity-80">First Name</label>
      <input
        type="text"
        value={editData.first_name}
        disabled={!editMode}
        onChange={(e) =>
          setEditData({ ...editData, first_name: e.target.value })
        }
        className={`w-full mt-1 px-3 py-2 rounded border
          ${
            isDark
              ? editMode
                ? "bg-neutral-700 border-green-400"
                : "bg-neutral-800 border-neutral-700 opacity-60"
              : editMode
              ? "bg-white border-green-400"
              : "bg-neutral-100 border-neutral-300 opacity-60"
          }`}
      />
    </div>

    {/* LAST NAME */}
    <div>
      <label className="text-sm opacity-80">Last Name</label>
      <input
        type="text"
        value={editData.last_name}
        disabled={!editMode}
        onChange={(e) =>
          setEditData({ ...editData, last_name: e.target.value })
        }
        className={`w-full mt-1 px-3 py-2 rounded border
          ${
            isDark
              ? editMode
                ? "bg-neutral-700 border-green-400"
                : "bg-neutral-800 border-neutral-700 opacity-60"
              : editMode
              ? "bg-white border-green-400"
              : "bg-neutral-100 border-neutral-300 opacity-60"
          }`}
      />
    </div>

    {/* EMAIL */}
    <div>
      <label className="text-sm opacity-80">Email</label>
      <input
        type="email"
        value={editData.email}
        disabled
        className={`w-full mt-1 px-3 py-2 rounded border opacity-60 cursor-not-allowed
          ${
            isDark
              ? "bg-neutral-800 border-neutral-700"
              : "bg-neutral-100 border-neutral-300"
          }`}
      />
    </div>

    {/* PHONE */}
    <div>
      <label className="text-sm opacity-80">Phone</label>
      <input
        type="text"
        value={editData.phone}
        disabled={!editMode}
        onChange={(e) =>
          setEditData({ ...editData, phone: e.target.value })
        }
        className={`w-full mt-1 mb-5 px-3 py-2 rounded border
          ${
            isDark
              ? editMode
                ? "bg-neutral-700 border-green-400"
                : "bg-neutral-800 border-neutral-700 opacity-60"
              : editMode
              ? "bg-white border-green-400"
              : "bg-neutral-100 border-neutral-300 opacity-60"
          }`}
      />
    </div>

  </div>
</div>


          {/* RIGHT — POSTS */}
          <div
            className="overflow-y-auto"
            id="profilePosts"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Posts</h2>

              <button
                onClick={() => {
                  const token = localStorage.getItem("access");
                  if (!token) return setShowLogin(true);
                  setEditingPost(null);
                  setShowCreatePost(true);
                }}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Create Post
              </button>
            </div>

            {posts.length === 0 ? (
              <p className={`${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                No posts yet.
              </p>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className={`rounded-2xl overflow-hidden shadow-md mb-4 ${cardBg} border ${borderColor}`}
                >
                  <header className="p-5 flex items-start gap-4 relative">
                    <div className="h-10 w-10 rounded-full bg-[#3a86ff]">
                      <img
  src={
    post.author.profile_picture
      ? post.author.profile_picture
      : "https://ui-avatars.com/api/?name=" +
        (post.author.first_name
          ? post.author.first_name
          : post.author.username)
  }
  alt="Author"
  width="50"
  className="rounded-full object-cover h-10 w-10"
/>

                    </div>

                    <div>
                      <div
                        className={`text-xs ${
                          isDark
                            ? "text-[#eaeaea]/70"
                            : "text-[#111111]/70"
                        }`}
                      >
                        <span className="font-bold">{post.author.username}</span>
                        {" • "}
                        {formatDate(post.created_at)}
                      </div>

                      {post.title && (
                        <h2 className={`mt-2 text-lg font-bold ${text}`}>
                          {post.title.length > 50
                            ? post.title.substring(0, 50) + "..."
                            : post.title}
                        </h2>
                      )}
                    </div>

                    <div className="ml-auto relative">
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === post.id ? null : post.id)
                        }
                        className="p-2 rounded-full hover:bg-gray-200/20"
                      >
                        ⋮
                      </button>

                      {menuOpen === post.id && (
                        <div
                          className={`absolute right-0 mt-2 w-10 rounded shadow-md border ${
                            isDark ? "bg-[#2c2c2c]" : "bg-white"
                          } z-20`}
                        >
                          <button
                            onClick={() => setEditingPost(post) || setShowCreatePost(true)}
                            className="w-full flex items-center justify-center px-1 py-1 hover:bg-gray-200/30"
                          >
                            <HiPencilAlt className="text-xl" />
                          </button>

                          <button
                            onClick={() => handleDelete(post.id)}
                            className="w-full flex items-center justify-center px-1 py-1 hover:bg-red-200/30"
                          >
                            <HiTrash className="text-xl" />
                          </button>
                        </div>
                      )}
                    </div>
                  </header>

                  <div className={`px-6 pb-6 ${text}`}>
                    <div className="text-base leading-relaxed">
                      {expandedPost === post.id
                        ? post.content
                        : post.content.length > 200
                        ? post.content.substring(0, 200) + "..."
                        : post.content}

                      {post.content.length > 200 && (
                        <button
                          onClick={() =>
                            setExpandedPost(
                              expandedPost === post.id ? null : post.id
                            )
                          }
                          className="mt-2 text-sm text-blue-500 hover:underline bg-transparent"
                        >
                          {expandedPost === post.id ? "See less" : "See more"}
                        </button>
                      )}
                    </div>

                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full max-h-96 object-cover rounded-xl mt-4"
                      />
                    )}

                    <div className="mt-5 flex items-center gap-4 text-sm font-medium">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 ${hoverBg} px-4 py-1 rounded border ${borderColor}`}
                      >
                        {post.is_liked ? (
                          <BiSolidLike className="text-blue-500" />
                        ) : (
                          <BiLike />
                        )}
                        <span>{post.total_likes}</span>
                      </button>

                      <button
                        onClick={() => openComments(post.id)}
                        className={`flex items-center gap-2 ${hoverBg} px-4 py-1 rounded border ${borderColor}`}
                      >
                        💬 {post.total_comments ?? post.total_replies ?? 0}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showCreatePost && (
        <ModalOverlay
          close={() => {
            setShowCreatePost(false);
            setEditingPost(null);
          }}
        >
          <CreatePostModal
            isDark={isDark}
            onClose={() => {
              setShowCreatePost(false);
              setEditingPost(null);
            }}
            onSuccess={(updatedPost) => {
              if (editingPost) {
                setPosts((prev) =>
                  prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
                );
              } else {
                setPosts((prev) => [updatedPost, ...prev]);
              }
            }}
            post={editingPost}
          />
        </ModalOverlay>
      )}

      {/* LOGIN MODAL */}
      {showLogin && (
        <ModalOverlay close={() => setShowLogin(false)}>
          <LoginModal
            isDark={isDark}
            onClose={() => setShowLogin(false)}
            onLogin={() => setShowLogin(false)}
            openSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
          />
        </ModalOverlay>
      )}

      {/* SIGNUP MODAL */}
      {showSignup && (
        <ModalOverlay close={() => setShowSignup(false)}>
          <SignupModal
            isDark={isDark}
            onRegister={() => setShowSignup(false)}
            onClose={() => setShowSignup(false)}
            openLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          />
        </ModalOverlay>
      )}
    </div>
  );
}

export default Profile;

/* -------------------------
   ModalOverlay component
------------------------- */
function ModalOverlay({ children, close }) {
  return (
    <div
      onClick={close}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
