import { useState, useEffect, useRef, useCallback } from "react";
import { FaPlus, FaTimes, FaImage, FaCheck } from "react-icons/fa";
import axiosSecure from "../../../components/utils/axiosSecure";
import CompanyPostCard from "./CompanyPostCard";
import { useAlert } from "../../../context/AlertContext";
import ModalOverlay from "../../../components/ui/ModalOverlay";
import { useSelector } from "react-redux";
import ConfirmationAlert from "../../../components/ui/ConfirmationAlert";

export default function CompanyPosts({ companyId, isDark, showCreate = true }) {
  const { showAlert } = useAlert();
  const { data: loggedUser } = useSelector((state) => state.user);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

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

  const fetchPosts = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await axiosSecure.get(`/v1/companies/${companyId}/posts/`, {
        params: { page },
      });
      const data = res.data?.results || res.data || [];
      const newPosts = Array.isArray(data) ? data : [];
      setPosts((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(!!res.data.next);
    } catch (err) {
      console.error("Error fetching company posts:", err);
      // showAlert("Error fetching posts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [companyId, page]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setCreating(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    files.forEach((file) => {
      formData.append("uploaded_files[]", file);
    });

    try {
      const res = await axiosSecure.post(
        `/v1/companies/${companyId}/posts/create/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setPosts((prev) => [res.data, ...prev]);
      setShowCreateModal(false);
      setTitle("");
      setContent("");
      setFiles([]);
      setPreviews([]);
      showAlert("Post created successfully!", "success");
    } catch (err) {
      console.error("Error creating post:", err);
      showAlert(err.response?.data?.message || "Error creating post", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (post) => {
    setEditPost(post);
    setTitle(post.title || "");
    setContent(post.content || "");
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setCreating(true);
    try {
      const res = await axiosSecure.patch(
        `/v1/companies/posts/${editPost.id}/update/`,
        { title, content }
      );
      setPosts((prev) =>
        prev.map((p) => (p.id === editPost.id ? { ...p, ...res.data } : p))
      );
      setShowCreateModal(false);
      setIsEditing(false);
      setEditPost(null);
      setTitle("");
      setContent("");
      showAlert("Post updated successfully!", "success");
    } catch (err) {
      console.error("Error updating post:", err);
      showAlert(err.response?.data?.message || "Error updating post", "error");
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setIsEditing(false);
    setEditPost(null);
    setTitle("");
    setContent("");
    setFiles([]);
    setPreviews([]);
  };

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
  const bgCard = isDark ? "bg-neutral-900" : "bg-white";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-black uppercase tracking-widest ${isDark ? "text-white" : "text-black"}`}>
          Company Posts
        </h2>
        {showCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <FaPlus />
            Create Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {posts.length > 0 ? (
          posts.map((post, index) => {
            const canModify = showCreate; // or check if loggedUser is member of company
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostRef} key={post.id}>
                  <CompanyPostCard post={post} isDark={isDark} onDelete={handleDeleteClick} onEdit={handleEditClick} isOwner={canModify} />
                </div>
              );
            } else {
              return <CompanyPostCard key={post.id} post={post} isDark={isDark} onDelete={handleDeleteClick} onEdit={handleEditClick} isOwner={canModify} />;
            }
          })
        ) : (
          !loading && (
            <div className="text-center py-10 opacity-50 italic">
              No posts found for this company.
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <ModalOverlay close={closeModal}>
          <div className={`p-8 md:p-12 shadow-2xl rounded-3xl ${bgCard} shadow-black/10 max-w-2xl w-full mx-4 animate-pop`}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className={`text-3xl font-black tracking-tighter mb-2 ${text}`}>
                  {isEditing ? "Edit Post" : "Create New Post"}
                </h1>
                <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {isEditing ? "Update your post title and content." : "Share updates, news, or articles from your company."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-neutral-400" : "hover:bg-black/10 text-neutral-500"}`}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={isEditing ? handleUpdatePost : handleCreatePost} className="space-y-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Content *
                </label>
                <textarea
                  required
                  rows="6"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none ${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                  placeholder="What's on your mind?..."
                ></textarea>
              </div>

              {/* Media Upload - Hidden in Edit Mode */}
              {!isEditing && (
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Attachments
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden group">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <label className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isDark ? "border-neutral-700 hover:border-red-500 text-neutral-500 hover:text-red-500" : "border-neutral-200 hover:border-red-500 text-neutral-400 hover:text-red-500"}`}>
                      <FaImage size={24} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Add Media</span>
                      <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-neutral-200 text-black hover:bg-neutral-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim() || !content.trim()}
                  className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <FaCheck />
                  )}
                  {isEditing ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

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
