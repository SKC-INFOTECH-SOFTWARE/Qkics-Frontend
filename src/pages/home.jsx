import { useState, useEffect } from "react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { HiPencilAlt, HiTrash } from "react-icons/hi";
import axiosSecure from "../components/utils/axiosSecure";

import useFeed from "../components/hooks/useFeed";
import useLike from "../components/hooks/useLike";
import useTags from "../components/hooks/useTags";

import CreatePostModal from "../components/posts/create_post";
import LoginModal from "../components/auth/login";
import SignupModal from "../components/auth/register";
import { API_BASE_URL } from "../config/api";

function Home({ theme, searchQuery }) {
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const bg = isDark ? "bg-[#0f0f0f]" : "bg-[#f5f5f5]";
  const cardBg = isDark ? "bg-[#2c2c2c]" : "bg-white";
  const hoverBg = isDark ? "hover:bg-[#3a3a3a]" : "hover:bg-[#f0f0f0]";
  const text = isDark ? "text-[#eaeaea]" : "text-[#111111]";
  const borderColor = isDark ? "border-white/15" : "border-black/10";

  const [selectedTag, setSelectedTag] = useState(null);

  // FEED WITH USER DATA — NOW WORKING
  const { posts, setPosts, user } = useFeed(selectedTag, searchQuery);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const [menuOpen, setMenuOpen] = useState(null);

  // NEW STATE FOR SEE MORE FEATURE
  const [expandedPost, setExpandedPost] = useState(null);

  const { handleLike } = useLike(setPosts, () => setShowLogin(true));
  const { tags, loading: loadingTags } = useTags();

  // Restore scroll after coming back from comments
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("scrollY");

    if (savedScroll && posts.length > 0) {
      setTimeout(() => window.scrollTo(0, Number(savedScroll)), 50);
      sessionStorage.removeItem("scrollY");
    }
  }, [posts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // DELETE POST
  const handleDelete = async (postId) => {
    if (!window.confirm("Do you really want to delete this post?")) return;

    try {
      const res = await axiosSecure.delete(`/v1/community/posts/${postId}/`);

      if (res.status === 204) {
        setPosts(posts.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (post) => {
    setEditingPost(post);
    setShowCreatePost(true);
  };

  console.log("BASE URL:", API_BASE_URL);

  console.log("BASE URL:", axiosSecure.defaults.baseURL);
console.log("FULL URL:", axiosSecure.getUri({ url: "/v1/community/posts/2/" }));


  return (
    <div className={`min-h-screen mt-3 ${bg}`}>
      <div className="pt-14 max-w-6xl mx-auto px-4 pb-10 grid grid-cols-12 gap-4">

        {/* LEFT SIDEBAR */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
          <div className={`sticky top-16 space-y-3 text-sm ${text}`}>

            <button
              onClick={() => {
                const token = localStorage.getItem("access");
                if (!token) return setShowLogin(true);
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

            {/* TAG SIDEBAR */}
            <div className="mt-6 space-y-1">
              <div className="px-4 flex items-center justify-between mb-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${text}/60`}>
                  Tags
                </p>

                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-[500px] overflow-y-scroll pr-2" style={{ scrollbarWidth: "thin" }}>
                {loadingTags ? (
                  <p className="px-4 py-2 text-xs opacity-70">Loading...</p>
                ) : (
                  <>
                    {(showAllTags ? tags : tags.slice(0, 8)).map((tag) => {
                      const isActive = selectedTag === tag.slug;
                      return (
                        <button
                          key={tag.id}
                          onClick={() => setSelectedTag(tag.slug)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl border ${borderColor} ${hoverBg}
                            ${isActive ? "border-red-500 bg-red-500/10 font-semibold" : ""}
                          `}
                        >
                          {tag.name}
                        </button>
                      );
                    })}

                    {tags.length > 8 && (
                      <button
                        className={`w-full px-4 py-2 mt-2 text-sm text text-blue-500 ${hoverBg} rounded-xl border ${borderColor}`}
                        onClick={() => setShowAllTags(!showAllTags)}
                      >
                        {showAllTags  ? "Show Less ▲" : "Show More ▼"}
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
          {posts.map((post) => (
            <article
              key={post.id}
              className={`rounded-2xl overflow-hidden shadow-md ${cardBg} border ${borderColor}`}
            >
              <header className="p-5 flex items-start gap-4 relative">
                <div className="h-10 w-10 rounded-full bg-[#3a86ff]">
                  <img
  src={
    post.author.profile_picture
      ? post.author.profile_picture
      : post.author.first_name
        ? `https://ui-avatars.com/api/?name=${post.author.first_name}&background=random&length=1`
        : `https://ui-avatars.com/api/?name=${post.author.username}&background=random&length=1`
  }
  alt={post.author.username}
  className="rounded-full object-cover h-10 w-10"
/>


                </div>

                <div>
                  <div className={`text-xs ${isDark ? "text-[#eaeaea]/70" : "text-[#111111]/70"}`}>
                    <span className="font-bold">{post.author.username}</span>
                    {" • "}
                    {formatDate(post.created_at)}
                  </div>

                  {/* TITLE LIMITED TO 50 CHARS */}
                  {post.title && (
                    <h2 className={`mt-2 text-lg font-bold ${text}`}>
                      {post.title.length > 50
                        ? post.title.substring(0, 50) + "..."
                        : post.title}
                    </h2>
                  )}
                </div>

                {/* OWNER-ONLY MENU — NOW WORKING */}
                {user && user.id === post.author.id && (
                  <div className="ml-auto relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                      className="p-2 rounded-full hover:bg-gray-200/20"
                    >
                      ⋮
                    </button>

                    {menuOpen === post.id && (
                      <div className={`absolute right-0 mt-2 w-10 rounded shadow-md border ${isDark ? "bg-[#2c2c2c]" : "bg-white"} z-20`}>
                        <button
                          onClick={() => openEditModal(post)}
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
                )}
              </header>

              <div className={`px-6 pb-6 ${text}`}>

                {/* CONTENT LIMITED TO 200 CHARS + SEE MORE */}
                <div className="text-base leading-relaxed">
                  {expandedPost === post.id
                    ? post.content
                    : post.content.length > 200
                      ? post.content.substring(0, 200) + "..."
                      : post.content}

                  {post.content.length > 200 && (
                    <button
                      onClick={() =>
                        setExpandedPost(expandedPost === post.id ? null : post.id)
                      }
                      className="mt-2 text-sm text-blue-500 hover:underline bg-transparent"
                    >
                      {expandedPost === post.id ? "See less" : "See more"}
                    </button>
                  )}
                </div>

                {/* TAGS */}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.slug)}
                        className={`text-sm px-3 py-1 rounded-full border border-blue-400/40 
                          hover:bg-blue-200/40
                          ${isDark 
                            ? "bg-blue-900/30 text-white hover:bg-blue-800/40" 
                            : "bg-blue-100/20 text-blue-600"
                          }
                        `}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                )}

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full max-h-96 object-cover rounded-xl mt-4"
                  />
                )}

                {/* LIKE + COMMENTS */}
                <div className="mt-5 flex items-center gap-4 text-sm font-medium">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 ${hoverBg} px-4 py-1 rounded border ${borderColor}`}
                  >
                    {post.is_liked ? <BiSolidLike className="text-blue-500" /> : <BiLike />}
                    <span>{post.total_likes}</span>
                  </button>

                  <button
                    onClick={() => {
                      const token = localStorage.getItem("access");
                      if (!token) return setShowLogin(true);

                      sessionStorage.setItem("scrollY", window.scrollY);
                      navigate(`/post/${post.id}/comments`);
                    }}
                    className={`flex items-center gap-2 ${hoverBg} px-4 py-1 rounded border ${borderColor}`}
                  >
                    💬 {post.total_comments}
                  </button>
                </div>

              </div>
            </article>
          ))}
        </main>

        {/* RIGHT SIDEBAR (unchanged) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5">

          <div className={`rounded-2xl overflow-hidden shadow-md ${cardBg} border ${borderColor}`}>
            <div className={`px-5 py-3 text-xs font-bold uppercase tracking-wider ${text}/50`}>
              Advertisement (DEMO)
            </div>
            <img src="https://placehold.co/400x400" alt="" />
            <div className="p-6">
              <h4 className={`${text} font-bold`}>Grow your business with PayPal</h4>
              <p className={`${text}/70 text-sm mt-1`}>Accept payments from anywhere.</p>
              <button className="mt-4 px-5 py-2 rounded-full bg-red-500 text-white font-bold shadow-md hover:shadow-lg">
                Get Started
              </button>
            </div>
          </div>

          <div className={`rounded-2xl overflow-hidden shadow-md ${cardBg} border ${borderColor}`}>
            <div className={`px-5 py-3 text-xs font-bold uppercase tracking-wider ${text}/50`}>
              Advertisement (DEMO)
            </div>
            <img src="https://placehold.co/400x400" alt="" />
            <div className="p-6">
              <h4 className={`${text} font-bold`}>Grow your business with PayPal</h4>
              <p className={`${text}/70 text-sm mt-1`}>Accept payments from anywhere.</p>
              <button className="mt-4 px-5 py-2 rounded-full bg-red-500 text-white font-bold shadow-md hover:shadow-lg">
                Get Started
              </button>
            </div>
          </div>

        </aside>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showCreatePost && (
        <ModalOverlay close={() => { setShowCreatePost(false); setEditingPost(null); }}>
          <CreatePostModal
            isDark={isDark}
            onClose={() => { setShowCreatePost(false); setEditingPost(null); }}
            onSuccess={(updatedPost) => {
              if (editingPost) {
                setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
              } else {
                setPosts([updatedPost, ...posts]);
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

export default Home;

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
