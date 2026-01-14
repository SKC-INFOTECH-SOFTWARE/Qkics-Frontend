import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import { useSelector } from "react-redux";

import { useConfirm } from "../context/ConfirmContext";
import { useAlert } from "../context/AlertContext";
import axiosSecure from "../components/utils/axiosSecure";
import useFeed from "../components/hooks/useFeed";
import useLike from "../components/hooks/useLike";
import useTags from "../components/hooks/useTags";
import { getAccessToken } from "../redux/store/tokenManager";

import CreatePostModal from "../components/posts/create_post";
import LoginModal from "../components/auth/Login";
import SignupModal from "../components/auth/Signup";
import ModalOverlay from "../components/ui/ModalOverlay";
import PostCard from "../components/posts/PostCard";

function Home() {
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();

  // THEME COLORS
  const bg = isDark ? "bg-[#0f0f0f]" : "bg-[#f5f5f5]";
  const cardBg = isDark ? "bg-[#2c2c2c]" : "bg-white";
  const hoverBg = isDark ? "hover:bg-[#3a3a3a]" : "hover:bg-[#f0f0f0]";
  const text = isDark ? "text-[#eaeaea]" : "text-[#111111]";
  const borderColor = isDark ? "border-white/15" : "border-black/10";

  // LOCAL STATES
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  // HOOKS
  const { posts, setPosts, loaderRef, next } = useFeed(null, searchQuery);

  const { handleLike } = useLike(
    setPosts,
    () => getAccessToken(),
    () => setShowLogin(true)
  );

  const { tags, loading: loadingTags } = useTags();

  // Restore scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("scrollY");
    if (savedScroll && posts.length > 0) {
      setTimeout(() => window.scrollTo(0, Number(savedScroll)), 50);
      sessionStorage.removeItem("scrollY");
    }
  }, [posts]);

  const goToProfile = (author) => {
    if (!loggedUser) {
      navigate(`/profile/${author.username}`);
      return;
    }

    if (loggedUser.username === author.username) {
      switch (loggedUser.user_type) {
        case "expert": navigate("/expert"); break;
        case "entrepreneur": navigate("/entrepreneur"); break;
        case "investor": navigate("/investor"); break;
        case "admin": navigate("/admin"); break;
        case "superadmin": navigate("/superadmin"); break;
        default: navigate("/normal");
      }
      return;
    }
    navigate(`/profile/${author.username}`);
  };

  const handleDelete = (postId) => {
    showConfirm({
      title: "Delete Post?",
      message: "Are you sure you want to delete this post?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const res = await axiosSecure.delete(`/v1/community/posts/${postId}/`);
          if (res.status === 204) {
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            showAlert("Post deleted successfully!", "success");
          }
        } catch {
          showAlert("Delete failed!", "error");
        }
      },
    });
  };

  const applySearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}&type=posts`);
    } else {
      const params = new URLSearchParams(searchParams);
      params.delete("search");
      setSearchParams(params);
    }
  };

  if (loggedUser?.user_type === "admin") return <Navigate to="/admin" />;
  if (loggedUser?.user_type === "superadmin") return <Navigate to="/superadmin" />;

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = url.split("/").pop() || "image.jpg";
      document.body.appendChild(a);
      a.click();
      a.click(); // Some browsers need double click?
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className={`min-h-screen mt-3 ${bg} pb-20 md:pb-10`}>
      <div className="pt-14 max-w-6xl mx-auto px-4 grid grid-cols-12 gap-4">

        {/* LEFT SIDEBAR */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
          <div className={`sticky top-16 space-y-3 text-sm ${text}`}>
            <button
              onClick={() => {
                if (!loggedUser) return setShowLogin(true);
                setEditingPost(null);
                setShowCreatePost(true);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${cardBg} ${hoverBg} border ${borderColor}`}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                <FaPlus />
              </span>
              <span className="font-semibold">Create Post</span>
            </button>

            <div className="mt-6 space-y-1">
              <div className="px-4 flex items-center justify-between mb-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${text}/60`}>Tags</p>
                {searchQuery && (
                  <button onClick={() => applySearch("")} className="text-[11px] text-red-500 hover:underline">Clear</button>
                )}
              </div>

              <div className="max-h-[500px] overflow-y-scroll pr-2" style={{ scrollbarWidth: "thin" }}>
                {loadingTags ? (
                  <p className="px-4 py-2 text-xs opacity-70">Loading...</p>
                ) : (
                  <>
                    {Array.isArray(tags) &&
                      (showAllTags ? tags : tags.slice(0, 8)).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => applySearch(tag.name)}
                          className={`w-full text-left px-4 py-2 mb-2 rounded-xl border ${borderColor} ${hoverBg}
                            ${searchQuery === tag.name ? "border-red-500 bg-red-500/10 font-semibold" : ""}
                          `}
                        >
                          {tag.name}
                        </button>
                      ))}

                    {Array.isArray(tags) && tags.length > 8 && (
                      <button
                        onClick={() => setShowAllTags(!showAllTags)}
                        className={`w-full px-4 py-2 mt-2 text-sm text-blue-500 ${hoverBg} rounded-xl border ${borderColor}`}
                      >
                        {showAllTags ? "Show Less ▲" : "Show More ▼"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN FEED */}
        <main className="col-span-12 md:col-span-6 lg:col-span-7 space-y-3">
          {/* MOBILE TAGS */}
          <div className="md:hidden relative group">
            <div className="overflow-x-auto pb-2 flex gap-2 no-scrollbar pr-14" style={{ scrollbarWidth: "none" }}>
              {loadingTags ? (
                <p className="text-xs opacity-50 px-2">Loading tags...</p>
              ) : (
                Array.isArray(tags) && tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => applySearch(tag.name)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0
                     ${searchQuery === tag.name
                        ? "bg-red-500 text-white border-red-500"
                        : `${cardBg} ${borderColor} ${text} opacity-80`
                      }`}
                  >
                    {tag.name}
                  </button>
                ))
              )}
            </div>
            {searchQuery && (
              <div className="absolute right-0 top-0 bottom-2 z-10 flex items-center pl-4 bg-gradient-to-l from-[#f5f5f5] dark:from-[#0f0f0f]">
                <button onClick={() => applySearch("")} className="text-white bg-red-500 text-[10px] font-bold px-3 py-2 rounded-full shadow-md">Clear</button>
              </div>
            )}
          </div>

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              loggedUser={loggedUser}
              isDark={isDark}
              onLike={handleLike}
              onDelete={handleDelete}
              onEdit={(p) => { setEditingPost(p); setShowCreatePost(true); }}
              onCommentClick={(p) => {
                if (!loggedUser) return setShowLogin(true);
                sessionStorage.setItem("scrollY", window.scrollY);
                navigate(`/post/${p.id}/comments`);
              }}
              onTagClick={applySearch}
              onImageClick={setPreviewImage}
              onProfileClick={goToProfile}
            />
          ))}

          <div ref={loaderRef} className="h-12 flex justify-center items-center opacity-50">
            {posts.length === 0 ? <p>No posts yet</p> : next ? <p>Loading more...</p> : <p>No more posts</p>}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5">
          <AdCard cardBg={cardBg} borderColor={borderColor} text={text} />
          <AdCard cardBg={cardBg} borderColor={borderColor} text={text} />
        </aside>
      </div>

      {showCreatePost && (
        <ModalOverlay close={() => { setShowCreatePost(false); setEditingPost(null); }}>
          <CreatePostModal
            isDark={isDark}
            post={editingPost}
            onClose={() => { setShowCreatePost(false); setEditingPost(null); }}
            onSuccess={(updatedPost) => {
              setPosts((prev) =>
                editingPost
                  ? prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
                  : [updatedPost, ...prev]
              );
            }}
          />
        </ModalOverlay>
      )}

      {showLogin && (
        <ModalOverlay close={() => setShowLogin(false)}>
          <LoginModal isDark={isDark} onClose={() => setShowLogin(false)} openSignup={() => { setShowLogin(false); setShowSignup(true); }} />
        </ModalOverlay>
      )}

      {showSignup && (
        <ModalOverlay close={() => setShowSignup(false)}>
          <SignupModal isDark={isDark} onClose={() => setShowSignup(false)} openLogin={() => { setShowSignup(false); setShowLogin(true); }} />
        </ModalOverlay>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center animate-fadeIn" onClick={() => { setPreviewImage(null); setZoom(1); }}>
          <div className="relative max-w-[95vw] max-h-[95vh] animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setPreviewImage(null); setZoom(1); }} className="absolute -top-4 -right-4 z-20 bg-black text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-red-500">✕</button>
            <button onClick={() => downloadImage(previewImage)} className="absolute -top-4 -left-4 z-20 bg-black text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-500" title="Download"><MdOutlineFileDownload /></button>
            <img src={previewImage} alt="Preview" className="rounded-lg shadow-2xl max-w-full max-h-[90vh] object-contain transition-transform duration-200" style={{ transform: `scale(${zoom})` }} onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))} draggable={false} />
          </div>
        </div>
      )}

      <button onClick={() => { if (!loggedUser) return setShowLogin(true); setEditingPost(null); setShowCreatePost(true); }} className="md:hidden fixed bottom-20 right-4 z-40 bg-red-500 text-white h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-red-600 active:scale-95 transition-transform">
        <FaPlus />
      </button>
    </div>
  );
}

function AdCard({ cardBg, borderColor, text }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-md ${cardBg} border ${borderColor}`}>
      <div className={`px-5 py-3 text-xs font-bold uppercase tracking-wider ${text}/50`}>Advertisement (DEMO)</div>
      <img src="https://skcinfotech.in/images/banner/ban1.png" alt="ads" />
      <div className="p-6">
        <h4 className={`${text} font-bold`}>Grow your business with PayPal</h4>
        <p className={`${text}/70 text-sm mt-1`}>Accept payments from anywhere.</p>
        <button className="mt-4 px-5 py-2 rounded-full bg-red-500 text-white font-bold shadow-md hover:shadow-lg">Get Started</button>
      </div>
    </div>
  );
}

export default Home;
