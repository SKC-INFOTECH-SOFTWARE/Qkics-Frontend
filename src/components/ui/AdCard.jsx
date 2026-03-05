import { useState, useEffect } from "react";
import axiosSecure from "../utils/axiosSecure";
import { resolveMedia } from "../utils/mediaUrl";

export default function AdCard({ isDark }) {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const { data } = await axiosSecure.get("/v1/ads/active/");
                if (data && Array.isArray(data)) {
                    setAds(data);
                }
            } catch (err) {
                console.error("Failed to fetch ads:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, []);

    if (loading) {
        return (
            <div className={`premium-card overflow-hidden group ${isDark ? "bg-neutral-900" : "bg-white"} animate-pulse`}>
                <div className="h-64 bg-neutral-800/10 dark:bg-neutral-800/30" />
            </div>
        );
    }

    if (!ads || ads.length === 0) {
        return null; // Return null if there are no ads to display
    }

    return (
        <div className="flex flex-col gap-8">
            {ads.map((ad) => (
                <AdCardItem key={ad.id || ad.uuid} ad={ad} isDark={isDark} />
            ))}
        </div>
    );
}

function AdCardItem({ ad, isDark }) {
    const [mediaError, setMediaError] = useState(false);

    // Attempt to resolve media properly - if API returns relative path, this will use VITE_API_URL from .env
    let mediaSrc = resolveMedia(ad.file_url);
    // Fallback: If it's missing the host but still not caught by resolveMedia logic, append it manually
    if (mediaSrc && mediaSrc.startsWith("/media/")) {
        mediaSrc = `${import.meta.env.VITE_API_URL}${mediaSrc}`;
    }

    const isVideo = ad.media_type === "video" || ad.media_type === "VIDEO";

    if (mediaError) {
        return null;
    }

    return (
        <div className={`premium-card overflow-hidden group ${isDark ? "bg-neutral-900" : "bg-white"}`}>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {ad.placement ? ad.placement.replace(/_/g, " ") : "Advertisement"}
                    </p>
                </div>
                <div className="relative overflow-hidden rounded-xl mb-6">
                    {isVideo ? (
                        <video
                            src={mediaSrc}
                            controls
                            autoPlay
                            muted
                            loop
                            className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setMediaError(true)}
                        />
                    ) : (
                        <img
                            src={mediaSrc}
                            alt="ads"
                            className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                console.error("Image failed to load:", mediaSrc);
                                setMediaError(true);
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                <h4 className="font-bold text-lg leading-tight mb-2">{ad.title}</h4>
                <p className="opacity-60 text-sm mb-6 leading-relaxed">{ad.description}</p>
                <a
                    href={ad.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all ${isDark ? "bg-white/5 text-white" : "bg-neutral-100 text-black"}`}
                >
                    {ad.button_text || "Learn More"}
                </a>
            </div>
        </div>
    );
}
