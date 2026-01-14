import axiosSecure from "../utils/axiosSecure";
import { getAccessToken } from "../../redux/store/tokenManager";

export default function useLike(setPosts, tokenGetter, openLoginModal) {
  const normalize = (data) => ({
    ...data,
    is_liked:
      data.is_liked === true ||
      data.is_liked === "true" ||
      data.is_liked === 1,
    total_likes: Number(data.total_likes || 0),
  });

  const handleLike = async (postId) => {
    const token =
      typeof tokenGetter === "function"
        ? tokenGetter()
        : tokenGetter || getAccessToken();

    if (!token) return openLoginModal();

    try {
      const res = await axiosSecure.post(`/v1/community/posts/${postId}/like/`);
      const updated = normalize(res.data.data);

      // ONLY update like state, not entire post object
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
              ...post,
              is_liked: updated.is_liked,
              total_likes: updated.total_likes,
            }
            : post
        )
      );
    } catch (error) {
      console.log("like-error:", error);
    }
  };

  return { handleLike };
}
