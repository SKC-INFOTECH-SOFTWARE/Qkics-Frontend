import { useState, useRef } from "react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { HiPencilAlt, HiTrash } from "react-icons/hi";
import { savePostViewState } from "../../redux/slices/postViewSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";

import useLike from "../../components/hooks/useLike";
import CreatePostModal from "../../components/posts/create_post";
import { useConfirm } from "../../context/ConfirmContext";
import { useAlert } from "../../context/AlertContext";
import axiosSecure from "../../components/utils/axiosSecure";
import useClickOutside from "../../components/hooks/useClickOutside";

import { updatePost, addPost, setEditingPost, setCreateModalOpen, removePost } from "../../redux/slices/postsSlice";

// 🌟 NEW — import TokenManager
import { getAccessToken } from "../../redux/store/tokenManager";

export default function UserPosts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: posts, editingPost, isCreateModalOpen: openCreate } = useSelector((state) => state.posts);
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const activeProfile = useSelector((state) => state.user.activeProfileData);

  const isDark = theme === "dark";
  const profileUser = activeProfile?.profile?.user || activeProfile?.profile || {};
  const isOwnProfile = loggedUser?.username === (profileUser.username || activeProfile?.profile?.username);
  const readOnly = !isOwnProfile;

  const setPosts = (callback) => {
    // This setter is needed for useLike.jsx which expects a state setter.
    // We'll simulate it by dispatching updates.
    if (typeof callback === "function") {
      const updatedPosts = callback(posts);
      // useLike only updates the specific post's like status
      const changedPost = updatedPosts.find((p, i) => p !== posts[i]);
      if (changedPost) {
        dispatch(updatePost(changedPost));
      }
    }
  };

  const handleSetOpenCreate = (val) => dispatch(setCreateModalOpen(val));
  const handleSetEditingPost = (val) => dispatch(setEditingPost(val));
  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();

  const internalHandleDelete = async (postId) => {
    showConfirm({
      title: "Delete Post?",
      message: "Are you sure you want to delete this post?",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await axiosSecure.delete(`/v1/community/posts/${postId}/`);
          dispatch(removePost(postId));
          showAlert("Post deleted!", "success");
        } catch (err) {
          console.log("Delete failed:", err);
          showAlert("Delete failed!", "error");
        }
      },
    });
  };

  // 🌟 Get token from TokenManager
  const token = getAccessToken();

  // 🌟 Correct useLike usage
  const { handleLike } = useLike(setPosts, token, () => {
    // setShowLogin is not defined here, but we can navigate to login
    navigate("/login");
  });

  const [menuOpen, setMenuOpen] = useState(null);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(null));
  const [expandedPost, setExpandedPost] = useState(null);

  const cardBg = isDark ? "bg-[#2c2c2c]" : "bg-white";
  const text = isDark ? "text-[#eaeaea]" : "text-[#111111]";
  const borderColor = isDark ? "border-white/15" : "border-black/10";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      : "";

  /* -----------------------
      OPEN COMMENTS PAGE
  ------------------------ */
  const handleOpenPost = (postId) => {
    if (!token) return navigate("/login");

    dispatch(
      savePostViewState({
        from: "normal-profile",
        tab: "posts",
        scroll: window.scrollY,
      })
    );

    navigate(`/post/${postId}/comments`);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Posts</h2>

        {!readOnly && (
          <button
            onClick={() => {
              if (!token) return navigate("/login");
              handleSetEditingPost(null);
              handleSetOpenCreate(true);
            }}
            className="px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Create Post
          </button>
        )}

      </div>

      {!posts || posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => {
          const author = post.author || {};

          return (
            <article
              key={post.id}
              className={`rounded-2xl overflow-hidden shadow mb-4 ${cardBg} border ${borderColor}`}
            >
              {/* HEADER */}
              <header className="p-5 flex items-start gap-4 relative">
                {/* AVATAR */}
                <img
                  src={
                    author.profile_picture ||
                    `https://ui-avatars.com/api/?name=${author.username || "User"}`
                  }
                  className="rounded-full object-cover h-10 w-10"
                  alt="author"
                />

                {/* TITLE SECTION */}
                <div>
                  <div
                    className={`text-xs ${isDark ? "text-[#eaeaea]/70" : "text-[#111111]/70"
                      }`}
                  >
                    <span className="font-bold">{author.username}</span> •{" "}
                    {formatDate(post.created_at)}
                  </div>

                  {post.title && (
                    <h2 className={`mt-2 text-lg font-bold ${text}`}>
                      {post.title.length > 60
                        ? post.title.substring(0, 60) + "..."
                        : post.title}
                    </h2>
                  )}
                </div>

                {/* MENU BUTTON */}
                {!readOnly && (
                  <div className="ml-auto relative" ref={menuOpen === post.id ? menuRef : null}>
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === post.id ? null : post.id)
                      }
                      className="p-2 rounded-full hover:bg-gray-200/20"
                    >
                      <FaEllipsisH />
                    </button>

                    {/* MENU DROPDOWN */}
                    {menuOpen === post.id && (
                      <div
                        className={`absolute right-0 mt-2 w-10 rounded shadow-md border ${isDark ? "bg-[#2c2c2c]" : "bg-white"
                          }`}
                      >
                        {/* EDIT */}
                        <button
                          onClick={() => {
                            handleSetEditingPost(post);
                            handleSetOpenCreate(true);
                          }}
                          className="px-1 py-1 hover:bg-gray-200/30 w-full flex justify-center"
                        >
                          <HiPencilAlt className="text-xl" />

                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => internalHandleDelete(post.id)}
                          className="px-1 py-1 hover:bg-red-200/30 w-full flex justify-center"
                        >
                          <HiTrash className="text-xl text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </header>

              {/* CONTENT */}
              <div className={`px-6 pb-6 ${text}`}>
                <div>
                  {expandedPost === post.id
                    ? post.content
                    : post.content?.length > 200
                      ? post.content.substring(0, 200) + "..."
                      : post.content}

                  {post.content?.length > 200 && (
                    <button
                      onClick={() =>
                        setExpandedPost(
                          expandedPost === post.id ? null : post.id
                        )
                      }
                      className="text-blue-500 text-sm ml-2"
                    >
                      {expandedPost === post.id ? "See less" : "See more"}
                    </button>
                  )}
                </div>

                {/* TAGS */}
                {(post.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={`text-sm px-3 py-1 rounded-full border border-blue-400/40 ${isDark
                          ? "bg-blue-900/30"
                          : "bg-blue-100/40 text-blue-600"
                          }`}
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* IMAGE */}
                {post.image && (
                  <img
                    src={post.image}
                    className="w-full max-h-96 object-contain rounded-xl mt-4"
                    alt="post"
                  />
                )}

                {/* LIKE + COMMENT */}
                <div className="mt-5 flex items-center gap-4 text-sm font-medium">
                  {/* LIKE BUTTON */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 px-4 py-1 rounded border ${borderColor}`}
                  >
                    {post.is_liked ? (
                      <BiSolidLike className="text-blue-500" />
                    ) : (
                      <BiLike />
                    )}
                    <span>{post.total_likes || 0}</span>
                  </button>

                  {/* COMMENTS BUTTON */}
                  <button
                    onClick={() => handleOpenPost(post.id)}
                    className={`flex items-center gap-2 px-4 py-1 rounded border ${borderColor}`}
                  >
                    💬 {post.total_comments ?? 0}
                  </button>
                </div>
              </div>
            </article>
          );
        })
      )}

      {/* POST MODAL */}
      {openCreate && (
        <CreatePostModal
          isDark={isDark}
          post={editingPost}
          onClose={() => {
            handleSetOpenCreate(false);
            handleSetEditingPost(null);
          }}
          onSuccess={(updated) => {
            if (editingPost) {
              dispatch(updatePost(updated));
            } else {
              dispatch(addPost(updated));
            }
          }}
        />
      )}
    </div>
  );
}
