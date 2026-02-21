// src/components/hooks/useCommentLike.jsx
import axiosSecure from "../utils/axiosSecure";
import { getAccessToken } from "../../redux/store/tokenManager";
import { normalizeCommentLike } from "../utils/normalizePost";

export default function useCommentLike(setComments, tokenGetter, openLoginModal) {
  const getToken = () => {
    if (typeof tokenGetter === "function") {
      return tokenGetter() || getAccessToken();
    }
    return tokenGetter || getAccessToken();
  };

  const handleCommentLike = async (commentId) => {
    const token = getToken();

    if (!token) {
      openLoginModal?.();
      return;
    }

    try {
      const res = await axiosSecure.post(`/v1/community/comments/${commentId}/like/`);
      const updated = normalizeCommentLike(res.data.data);

      setComments((prev) =>
        prev.map((comment) => {
          // Case 1: Parent comment
          if (comment.id === updated.id && updated.parent === null) {
            return {
              ...comment,
              total_likes: updated.total_likes,
              is_liked: updated.is_liked,
            };
          }

          // Case 2: Reply inside this comment
          if (comment.replies?.some((r) => r.id === updated.id)) {
            return {
              ...comment,
              replies: comment.replies.map((r) =>
                r.id === updated.id
                  ? {
                      ...r,
                      total_likes: updated.total_likes,
                      is_liked: updated.is_liked,
                    }
                  : r
              ),
            };
          }

          return comment;
        })
      );
    } catch (err) {
      console.log("Comment like error:", err);
    }
  };

  return { handleCommentLike };
}