import { useState, useRef } from "react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { FaGraduationCap, FaUser, FaBriefcase, FaEllipsisH } from "react-icons/fa";
import { IoIosRocket } from "react-icons/io";
import { HiPencilAlt, HiTrash } from "react-icons/hi";
import UserBadge from "../ui/UserBadge";
import useClickOutside from "../hooks/useClickOutside";

// HELPER: Time Ago
const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    for (let unit in intervals) {
        const val = Math.floor(seconds / intervals[unit]);
        if (val >= 1) return `${val} ${unit}${val > 1 ? "s" : ""} ago`;
    }
    return "Just now";
};

// HELPER: User Badge - Removed and moved to reusable component

export default function PostCard({
    post,
    loggedUser,
    isDark,
    onLike,
    onDelete,
    onEdit,
    onCommentClick,
    onTagClick,
    onImageClick,
    onProfileClick,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useClickOutside(menuRef, () => setMenuOpen(false));
    const [expanded, setExpanded] = useState(false);

    const cardBg = isDark ? "bg-[#2c2c2c]" : "bg-white";
    const text = isDark ? "text-[#eaeaea]" : "text-[#111111]";
    const borderColor = isDark ? "border-white/15" : "border-black/10";
    const hoverBg = isDark ? "hover:bg-[#3a3a3a]" : "hover:bg-[#f0f0f0]";

    return (
        <article className={`rounded-2xl overflow-hidden border ${borderColor} ${cardBg} shadow-sm hover:shadow-lg transition-shadow`}>
            {/* HEADER */}
            <header className="p-5 flex items-start gap-4 relative">
                <div
                    className="h-11 w-11 rounded-full overflow-hidden cursor-pointer"
                    onClick={() => onProfileClick?.(post.author)}
                >
                    <img
                        src={
                            post.author.profile_picture
                                ? `${post.author.profile_picture}?t=${Date.now()}`
                                : `https://ui-avatars.com/api/?name=${post.author.username}&background=random&length=1`
                        }
                        className="rounded-full object-cover h-full w-full"
                        alt="profile"
                    />
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span
                            className={`font-semibold cursor-pointer hover:underline ${text}`}
                            onClick={() => onProfileClick?.(post.author)}
                        >
                            {post.author.first_name || post.author.last_name
                                ? `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim()
                                : post.author.username}
                        </span>
                        <UserBadge userType={post.author.user_type} isDark={isDark} />
                    </div>
                    <span className="text-xs opacity-60">{timeAgo(post.created_at)}</span>
                </div>

                {/* MENU */}
                {loggedUser && loggedUser.id === post.author.id && (
                    <div className="ml-auto relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-full hover:bg-gray-200/20"
                        >
                            <FaEllipsisH />
                        </button>

                        {menuOpen && (
                            <div className={`absolute right-0 mt-2 w-32 rounded-xl shadow-lg border ${cardBg} p-1 z-20`}>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onEdit?.(post);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200/20 flex items-center gap-2"
                                >
                                    <HiPencilAlt /> Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onDelete?.(post.id);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-200/20 text-red-500 flex items-center gap-2"
                                >
                                    <HiTrash /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* CONTENT */}
            <div className={`px-6 pb-6 leading-relaxed ${text}`}>
                {post.title && (
                    <h2 className="text-lg font-bold">
                        {post.title.length > 60 ? post.title.slice(0, 60) + "…" : post.title}
                    </h2>
                )}

                <p>
                    {expanded
                        ? post.content
                        : post.content.length > 200
                            ? post.content.slice(0, 200) + "…"
                            : post.content}
                </p>

                {post.content.length > 200 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-2 text-sm text-blue-500 hover:underline"
                    >
                        {expanded ? "See less" : "See more"}
                    </button>
                )}

                {/* TAGS */}
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag.id}
                                onClick={() => onTagClick?.(tag.name)}
                                className={`px-3 py-1 text-xs cursor-pointer rounded-full border 
                  ${isDark
                                        ? "bg-blue-900/30 text-blue-300 border-blue-800"
                                        : "bg-blue-100 text-blue-700 border-blue-300"
                                    } hover:bg-blue-200/40`}
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* IMAGE */}
                {post.image && (
                    <div className="mt-4 overflow-hidden rounded-xl cursor-pointer">
                        <img
                            src={post.image}
                            alt="post"
                            className="w-full h-auto object-contain block"
                            loading="lazy"
                            onClick={() => onImageClick?.(post.image)}
                        />
                    </div>
                )}

                {/* ACTION BAR */}
                <div className="mt-5 flex items-center gap-5 text-sm">
                    <button
                        onClick={() => onLike?.(post.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${borderColor} ${hoverBg}`}
                    >
                        {post.is_liked ? (
                            <BiSolidLike className="text-blue-500" />
                        ) : (
                            <BiLike />
                        )}
                        <span>{post.total_likes}</span>
                    </button>

                    <button
                        onClick={() => onCommentClick?.(post)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${borderColor} ${hoverBg}`}
                    >
                        💬 {post.total_comments}
                    </button>
                </div>
            </div>
        </article>
    );
}
