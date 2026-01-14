import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdOutlineFileDownload } from "react-icons/md";

import useSearchPosts from "../components/hooks/useSearch";
import useSearchProfiles from "../components/hooks/useSearchProfiles";
import useTags from "../components/hooks/useTags";
import useLike from "../components/hooks/useLike";
import { useConfirm } from "../context/ConfirmContext";
import { useAlert } from "../context/AlertContext";
import { getAccessToken } from "../redux/store/tokenManager";
import axiosSecure from "../components/utils/axiosSecure";

import PostCard from "../components/posts/PostCard";
import ModalOverlay from "../components/ui/ModalOverlay";
import LoginModal from "../components/auth/Login";
import SignupModal from "../components/auth/Signup";
import UserBadge from "../components/ui/UserBadge";
import CreatePostModal from "../components/posts/create_post";

export default function SearchResultsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { theme, data: loggedUser } = useSelector((state) => state.user);
    const isDark = theme === "dark";

    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "posts";

    const {
        searchPosts,
        results: postResults,
        setResults: setPostResults,
        loading: postLoading,
    } = useSearchPosts();

    const {
        searchProfiles,
        results: profileResults,
        loading: profileLoading,
    } = useSearchProfiles();

    const { tags, loading: loadingTags } = useTags();
    const { showConfirm } = useConfirm();
    const { showAlert } = useAlert();

    // LOCAL STATES
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    // HOOKS
    const { handleLike } = useLike(
        setPostResults,
        () => getAccessToken(),
        () => setShowLogin(true)
    );

    // THEME COLORS
    const bg = isDark ? "bg-[#0f0f0f]" : "bg-[#f5f5f5]";
    const cardBg = isDark ? "bg-[#2c2c2c]" : "bg-white";
    const text = isDark ? "text-[#eaeaea]" : "text-[#111111]";
    const mutedText = isDark ? "text-neutral-500" : "text-neutral-500";
    const borderColor = isDark ? "border-white/10" : "border-black/5";
    const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-black/5";

    /* 🔄 Fetch when query or tab changes */
    useEffect(() => {
        if (!query.trim()) return;

        if (type === "posts") {
            searchPosts(query);
        } else if (type === "profiles") {
            searchProfiles(query);
        }
    }, [query, type, searchPosts, searchProfiles]);

    const switchTab = (nextType) => {
        const next = new URLSearchParams(searchParams);
        next.set("type", nextType);
        setSearchParams(next);
    };

    const applySearch = (value) => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value.trim())}&type=posts`);
        }
    };

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
                        setPostResults((prev) => prev.filter((p) => p.id !== postId));
                        showAlert("Post deleted successfully!", "success");
                    }
                } catch {
                    showAlert("Delete failed!", "error");
                }
            },
        });
    };

    const goBack = () => {
  navigate(-1);
};

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
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    return (
        <div className={`min-h-screen ${bg} transition-colors duration-300 pt-20 pb-10`}>
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-12 gap-4">

                {/* SIDEBAR: TAGS (Hidden on mobile) */}
                <aside className="hidden md:block md:col-span-3 lg:col-span-2">
                    <div className="sticky top-20 space-y-6">
                        <div className="space-y-3">

  {/* 🔙 BACK BUTTON */}
  <button
  onClick={goBack}
  className={`
    mx-2 mb-4 flex items-center gap-2
    px-5 py-2 rounded
    border ${borderColor} ${cardBg}
    ${hoverBg} ${text}
    text-sm font-semibold
    shadow-sm hover:shadow-md
    transition-all duration-200
    active:scale-95
  `}
>
  <span className="text-lg leading-none">←</span>
  <span>Back</span>
</button>


  {/* TAGS HEADER */}
  <p className={`px-4 text-xs font-bold uppercase tracking-wider ${mutedText}`}>
    Tags
  </p>

                            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar space-y-1">
                                {loadingTags ? (
                                    <p className="px-4 py-2 text-xs opacity-50">Loading...</p>
                                ) : (
                                    <>
                                        {Array.isArray(tags) && (showAllTags ? tags : tags.slice(0, 10)).map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => applySearch(tag.name)}
                                                className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all border ${borderColor} ${hoverBg} ${text}
                           ${query === tag.name ? "border-red-500 bg-red-500/10 font-bold" : ""}
                        `}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                        {Array.isArray(tags) && tags.length > 10 && (
                                            <button
                                                onClick={() => setShowAllTags(!showAllTags)}
                                                className={`w-full px-4 py-2 text-xs text-blue-500 font-semibold hover:${hoverBg} rounded-xl`}
                                            >
                                                {showAllTags ? "Show Less" : "Show More"}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="col-span-12 md:col-span-9 lg:col-span-7">
                    {/* HEADER */}
                    <div className="mb-6">
                        <h1 className={`text-xl font-bold ${text}`}>
                            Results for <span className="text-red-500">“{query}”</span>
                        </h1>
                    </div>

                    {/* TABS */}
                    <div className={`flex gap-6 border-b ${borderColor} mb-6`}>
                        {["posts", "profiles"].map((t) => (
                            <button
                                key={t}
                                onClick={() => switchTab(t)}
                                className={`pb-3 text-sm font-semibold transition-all relative capitalize ${type === t ? "text-red-500" : `${mutedText} hover:${text}`}`}
                            >
                                {t === "profiles" ? "People" : t}
                                {type === t && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* RESULTS GRID/LIST */}
                    <div className="space-y-4">
                        {type === "posts" && (
                            <>
                                {postLoading && (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={`h-40 rounded-2xl animate-pulse ${cardBg} border ${borderColor}`} />
                                        ))}
                                    </div>
                                )}
                                {!postLoading && postResults.length === 0 && (
                                    <div className={`text-center py-20 rounded-2xl ${cardBg} border ${borderColor} ${mutedText}`}>
                                        No posts found matching “{query}”
                                    </div>
                                )}
                                {!postLoading && postResults.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        loggedUser={loggedUser}
                                        isDark={isDark}
                                        onLike={handleLike}
                                        onDelete={handleDelete}
                                        onEdit={(p) => { setEditingPost(p); setShowEditModal(true); }}
                                        onCommentClick={(p) => navigate(`/post/${p.id}/comments`)}
                                        onTagClick={applySearch}
                                        onImageClick={setPreviewImage}
                                        onProfileClick={goToProfile}
                                    />
                                ))}
                            </>
                        )}

                        {type === "profiles" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {profileLoading && (
                                    [1, 2, 3, 4].map((i) => (
                                        <div key={i} className={`h-24 rounded-2xl animate-pulse ${cardBg} border ${borderColor}`} />
                                    ))
                                )}
                                {!profileLoading && profileResults.length === 0 && (
                                    <div className={`col-span-full text-center py-20 rounded-2xl ${cardBg} border ${borderColor} ${mutedText}`}>
                                        No people found matching “{query}”
                                    </div>
                                )}
                                {!profileLoading && profileResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${borderColor} ${cardBg} hover:shadow-md transition-all cursor-pointer`}
                                        onClick={() => goToProfile(user)}
                                    >
                                        <img
                                            src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                            className="h-12 w-12 rounded-full object-cover"
                                            alt={user.username}
                                        />
                                        <div className="min-w-0">
                                            <p className={`font-bold ${text} truncate`}>{user.first_name || user.username} {user.last_name || ""}</p>
                                            <p className={`text-xs ${mutedText}`}>@{user.username}</p>
                                            <div className="mt-1">
                                                <UserBadge userType={user.user_type} isDark={isDark} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* AD SIDEBAR (Visible only on large screens) */}
                <aside className="hidden lg:block lg:col-span-3 space-y-4">
                    <div className={`p-5 rounded-2xl ${cardBg} border ${borderColor}`}>
                        <h4 className={`font-bold ${text} mb-2`}>New to Community?</h4>
                        <p className={`text-xs ${mutedText} leading-relaxed`}>
                            Connect with experts and investors to grow your startup!
                        </p>
                    </div>
                </aside>
            </div>

            {/* MODALS */}
            {showEditModal && (
                <ModalOverlay close={() => { setShowEditModal(false); setEditingPost(null); }}>
                    <CreatePostModal
                        isDark={isDark}
                        post={editingPost}
                        onClose={() => { setShowEditModal(false); setEditingPost(null); }}
                        onSuccess={(updatedPost) => {
                            setPostResults((prev) => prev.map((p) => p.id === updatedPost.id ? updatedPost : p));
                            setShowEditModal(false);
                            setEditingPost(null);
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
        </div>
    );
}
