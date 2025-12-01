import { useState } from "react";
import axiosSecure from "../utils/axiosSecure";
import useTags from "../hooks/useTags";
import { useAlert } from "../../context/AlertContext";

function CreatePostModal({ onClose, onSuccess, isDark, post }) {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
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
    if (!content.trim()) return showAlert("Content is required", "warning");

    setLoading(true);

    try {
      // CASE A: EDIT and NO new image file
      //  - if user requested removal -> send JSON with image: null
      //  - if user did NOT touch image -> send JSON without image (keep existing)
      if (post && !newImageFile) {
        if (removeImage) {
          // Send JSON with explicit image: null to remove it (works in Postman)
          const payload = {
            title,
            content,
            tags: selectedTags,
            image: null,
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
        } else {
          // No image change: send JSON normally
          const payload = {
            title,
            content,
            tags: selectedTags,
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
      }

      // CASE B: CREATE or EDIT with a NEW IMAGE -> use multipart/form-data
      // Build FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // For DRF ListField, sending tags as JSON in multipart is not reliable across setups.
      // Append tags individually (DRF will parse multiple 'tags' fields to a list):
      selectedTags.forEach((id) => formData.append("tags", id));

      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      let res;
      if (post) {
        // Update with multipart (replace image)
        res = await axiosSecure.put(`/v1/community/posts/${post.id}/`, formData);
      } else {
        // Create new post with multipart
        res = await axiosSecure.post("/v1/community/posts/", formData);
      }

      showAlert(post ? "Post updated!" : "Post created!", "success");
      onSuccess(res.data);
      onClose();
    } catch (err) {
      console.log("Submit error:", err.response?.status, err.response?.data || err);
      if (err.response?.data) {
        // show the main validation keys (friendly)
        showAlert("Action failed: " + JSON.stringify(err.response.data), "error");
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
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-xl ${bg} border ${border}`}
      >
        <h2 className="text-xl font-semibold mb-4">
          {post ? "Edit Post" : "Create a Post"}
        </h2>

        {/* ---------------- TITLE ---------------- */}
        <h3 className="text-sm font-semibold mb-2">Title :</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className={`w-full px-3 py-2 mb-1 rounded border ${border} ${inputBg}`}
          placeholder="Post title..."
        />
        <p className="text-xs opacity-60 mb-3">{title.length}/200</p>

        {/* ---------------- CONTENT ---------------- */}
        <h3 className="text-sm font-semibold mb-2">Content :</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className={`w-full px-3 py-2 mb-1 rounded border ${border} ${inputBg}`}
          placeholder="Write your post content..."
        />
        <p className="text-xs opacity-60 mb-3">{content.length}/8000</p>

        {/* ---------------- TAGS ---------------- */}
        <h3 className="text-sm font-semibold mb-2">Tags (max 5):</h3>

        {loadingTags ? (
          <p className="text-xs opacity-70 mb-4">Loading tags...</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full border text-sm transition ${active
                    ? "bg-blue-600 text-white border-blue-600"
                    : `${border} ${inputBg} hover:bg-neutral-200/50`
                    }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}

        {/* ---------------- IMAGE ---------------- */}
        <h3 className="text-sm font-semibold mb-2">Image :</h3>

        {image ? (
          <div className="mb-4 relative">
            <img
              src={image}
              alt="Preview"
              className="max-h-60 w-full object-cover rounded-xl border"
            />

            <button
              onClick={() => {
                setImage(null);
                setNewImageFile(null);
                setRemoveImage(true);
              }}
              className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            id="post-image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full px-3 py-2 rounded border mb-4 ${border} ${inputBg}`}
          />
        )}

        {/* ---------------- BUTTONS ---------------- */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-neutral-500 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            {loading ? "Saving..." : post ? "Update" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
