import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import axiosSecure from "../../components/utils/axiosSecure";
import CompanyPostCard from "./components/CompanyPostCard";
import { useAlert } from "../../context/AlertContext";
import { FaBuilding } from "react-icons/fa";
import ConfirmationAlert from "../../components/ui/ConfirmationAlert";

export default function CompanyPage() {
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const isDark = theme === "dark";
  const { showAlert } = useAlert();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [myCompanyIds, setMyCompanyIds] = useState([]);

  const observer = useRef();
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchGlobalCompanyPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get("/v1/companies/posts/", {
        params: { page },
      });
      const data = res.data?.results || res.data || [];
      const newPosts = Array.isArray(data) ? data : [];
      setPosts((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(!!res.data.next);
    } catch (err) {
      console.error("Error fetching global company posts:", err);
      // showAlert("Error fetching discovery feed", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCompanies = async () => {
    try {
      const res = await axiosSecure.get("/v1/companies/my/");
      const results = res.data?.results || [];
      setMyCompanyIds(results.map(c => c.id));
    } catch (err) {
      console.error("Error fetching my companies:", err);
    }
  };

  useEffect(() => {
    fetchMyCompanies();
  }, []);

  useEffect(() => {
    fetchGlobalCompanyPosts();
  }, [page]);

  const handleDeleteClick = (postId) => {
    setPostIdToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    if (!postIdToDelete) return;
    try {
      await axiosSecure.delete(`/v1/companies/posts/${postIdToDelete}/delete/`);
      setPosts((prev) => prev.filter((p) => p.id !== postIdToDelete));
      showAlert("Post deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting post:", err);
      showAlert("Error deleting post", "error");
    } finally {
      setShowDeleteConfirm(false);
      setPostIdToDelete(null);
    }
  };

  const text = isDark ? "text-white" : "text-black";

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 ${isDark ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
              <FaBuilding size={20} />
            </div>
            <h1 className={`text-4xl font-black tracking-tighter ${text}`}>Company Discovery</h1>
          </div>
          <p className={`text-sm tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Explore insights, updates, and innovations from across the organization
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {posts.length > 0 ? (
            posts.map((post, index) => {
              if (posts.length === index + 1) {
                return (
                  <div ref={lastPostRef} key={post.id}>
                    <CompanyPostCard key={post.id} post={post} isDark={isDark} onDelete={handleDeleteClick} isOwner={myCompanyIds.includes(post.company?.id) || post?.author?.split?.(" ")?.[0]?.trim() === loggedUser?.username} />
                  </div>
                );
              } else {
                return <CompanyPostCard key={post.id} post={post} isDark={isDark} onDelete={handleDeleteClick} isOwner={myCompanyIds.includes(post.company?.id) || post?.author?.split?.(" ")?.[0]?.trim() === loggedUser?.username} />;
              }
            })
          ) : (
            !loading && (
              <div className="text-center py-20 animate-fadeIn">
                <p className={`text-lg font-bold opacity-30 ${text}`}>No company posts discovered yet.</p>
              </div>
            )
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Loading Discovery...</p>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmationAlert
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          onConfirm={confirmDeletePost}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPostIdToDelete(null);
          }}
        />
      )}
    </div>
  );
}
