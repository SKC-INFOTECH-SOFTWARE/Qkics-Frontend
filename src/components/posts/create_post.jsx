import { useState, useEffect } from "react";

import axiosSecure from "../utils/axiosSecure";
import useTags from "../hooks/useTags";
import { useAlert } from "../../context/AlertContext";

function CreatePostModal({ onClose, onSuccess, isDark, post }) {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState("");
  useEffect(() => {
    if (!post) return;

    // Backend already sends full content if this is your post
    setContent(post.content || "");
  }, [post]);



  const [selectedTags, setSelectedTags] = useState(
    post ? post.tags.map((t) => t.id) : []
  );

  const [image, setImage] = useState(post?.image || null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const { tags, loading: loadingTags } = useTags();

  const [loading, setLoading] = useState(false);

  const bg = isDark ? "bg-neutral-900 text-white" : "bg-white text-black";
  const inputBg = isDark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-black";
  const border = isDark ? "border-neutral-700" : "border-neutral-300";

  /* ---------------------------
      TAG SELECTION
  --------------------------- */
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag.id));
    } else {
      if (selectedTags.length >= 5) {
        showAlert("Max 5 tags allowed", "warning");
        return;
      }
      setSelectedTags([...selectedTags, tag.id]);
    }
  };

  /* ---------------------------
      IMAGE SELECTION
  --------------------------- */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewImageFile(file);
    setImage(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  /* ---------------------------
      SUBMIT HANDLER
  --------------------------- */
  // inside your CreatePostModal component
  const handleSubmit = async () => {
    if (!content.trim()) {
      return showAlert("Content is required", "warning");
    }

    setLoading(true);

    const PREVIEW_LIMIT = 500;
    const FULL_LIMIT = 10000;

    const normalizedContent = content.slice(0, FULL_LIMIT);

    const preview_content = normalizedContent.slice(0, PREVIEW_LIMIT);
    const full_content = normalizedContent; // REQUIRED by backend



    try {
      /* ------------------------------------------------
          CASE A: EDIT + NO NEW IMAGE (JSON)
      ------------------------------------------------ */
      if (post && !newImageFile) {
        const payload = {
          title,
          preview_content,
          full_content,
          tags: selectedTags,
          ...(removeImage ? { image: null } : {}),
        };

        const res = await axiosSecure.put(
          `/v1/community/posts/${post.id}/`,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        showAlert("Post updated!", "success");
        onSuccess(res.data);
        onClose();
        return;
      }

      /* ------------------------------------------------
          CASE B: CREATE or EDIT WITH NEW IMAGE (multipart)
      ------------------------------------------------ */
      const formData = new FormData();



      formData.append("title", title);
      formData.append("preview_content", preview_content);

      if (full_content) {
        formData.append("full_content", full_content);
      }

      selectedTags.forEach((id) => formData.append("tags", id));

      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      let res;
      if (post) {
        res = await axiosSecure.put(
          `/v1/community/posts/${post.id}/`,
          formData
        );
      } else {
        res = await axiosSecure.post(
          "/v1/community/posts/",
          formData
        );
      }

      showAlert(post ? "Post updated!" : "Post created!", "success");
      onSuccess(res.data);
      onClose();
    } catch (err) {
      console.log("Submit error:", err.response?.status, err.response?.data || err);

      if (err.response?.data) {
        showAlert(
          "Action failed: " + JSON.stringify(err.response.data),
          "error"
        );
      } else {
        showAlert("Action failed. Check console.", "error");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-10 rounded-[2.5rem] shadow-2xl ${bg} border ${border} transition-all duration-300 mx-auto`}
      >
        <div className="flex justify-between items-start mb-8 text-left">
          <div className="text-left">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-left">
              {post ? "Edit Post" : "Create Post"}
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mt-1 text-left">
              Share your thoughts with the community
            </p>
          </div>
          <button
            onClick={onClose}
            className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${isDark ? "bg-white/5 hover:bg-white/10 text-neutral-400" : "bg-black/5 hover:bg-black/10 text-neutral-500"
              }`}
          >✕</button>
        </div>

        <div className="space-y-6">
          {/* ---------------- TITLE ---------------- */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block text-left">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className={`w-full px-4 py-3.5 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-red-600/20 ${isDark ? "bg-neutral-800 border-white/5 focus:border-red-600/50" : "bg-neutral-50 border-black/5 focus:border-red-600/30"
                }`}
              placeholder="e.g. The future of AI in 2026..."
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] font-bold opacity-40">{title.length}/200</span>
            </div>
          </div>

          {/* ---------------- CONTENT ---------------- */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block text-left">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={10000}
              className={`w-full px-4 py-3.5 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-red-600/20 resize-none ${isDark ? "bg-neutral-800 border-white/5 focus:border-red-600/50" : "bg-neutral-50 border-black/5 focus:border-red-600/30"
                }`}
              placeholder="What's on your mind?..."
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] font-bold opacity-40">{content.length}/10000</span>
            </div>
          </div>


          {/* ---------------- TAGS ---------------- */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3 block text-left">Tags (max 5)</label>

            {loadingTags ? (
              <div className="animate-pulse flex gap-2">
                {[1, 2, 3].map(i => <div key={i} className="h-8 w-20 bg-neutral-800 rounded-full" />)}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${active
                        ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20"
                        : isDark ? "bg-white/5 text-neutral-400 border-white/5 hover:border-white/20" : "bg-black/5 text-neutral-500 border-black/5 hover:border-black/20"
                        }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------------- IMAGE ---------------- */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3 block text-left">Media attachment</label>

            {image ? (
              <div className="relative rounded-[2rem] overflow-hidden border border-white/5 group">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-auto max-h-[300px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={() => {
                      setImage(null);
                      setNewImageFile(null);
                      setRemoveImage(true);
                    }}
                    className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    Delete Artwork
                  </button>
                </div>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${isDark ? "border-white/10 hover:border-red-500/50 bg-white/5" : "border-black/10 hover:border-red-600/50 bg-black/5"
                  }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-1">📸</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Upload Media</span>
                </div>
                <input
                  id="post-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ---------------- BUTTONS ---------------- */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button
              onClick={onClose}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black"
                }`}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${loading
                ? "bg-neutral-500/20 text-neutral-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 hover:shadow-red-600/40"
                }`}
            >
              {loading ? "Discovering..." : post ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
