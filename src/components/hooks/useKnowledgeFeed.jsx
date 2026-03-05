// src/components/hooks/useKnowledgeFeed.jsx
import { useState, useEffect, useRef } from "react";
import axiosSecure from "../utils/axiosSecure";
import { normalizePost } from "../utils/normalizePost";

export default function useKnowledgeFeed(searchQuery) {
    const [posts, setPosts] = useState([]);
    const [next, setNext] = useState(null);
    const loaderRef = useRef(null);

    const extractResults = (data) => {
        if (Array.isArray(data)) return { results: data, next: null };
        return { results: data.results || [], next: data.next || null };
    };

    const loadFeed = async () => {
        let url = "";

        if (searchQuery && searchQuery.trim() !== "") {
            const cleanQuery = searchQuery.replace(/-/g, " ");
            url = `/v1/community/search/?q=${cleanQuery}`;
        } else {
            url = `/v1/community/posts/`;
        }

        setPosts([]);
        setNext(null);

        try {
            const res = await axiosSecure.get(url);
            const parsed = extractResults(res.data);
            // Filter out only true knowledge_hub posts
            const filteredResults = parsed.results.map(normalizePost).filter((p) => p.knowledge_hub === true);
            setPosts(filteredResults);
            setNext(parsed.next);
        } catch (err) {
            console.error("Failed to load knowledge feed", err);
        }
    };

    const loadMore = async () => {
        if (!next) return;
        try {
            const res = await axiosSecure.get(next);
            const parsed = extractResults(res.data);
            // Filter out only true knowledge_hub posts
            const filteredResults = parsed.results.map(normalizePost).filter((p) => p.knowledge_hub === true);
            setPosts((prev) => [...prev, ...filteredResults]);
            setNext(parsed.next);
        } catch (err) {
            console.error("Failed to load more knowledge feed", err);
        }
    };

    useEffect(() => {
        if (!loaderRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { threshold: 0.1 }
        );

        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [next]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            loadFeed();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery]);

    return { posts, setPosts, loaderRef, next };
}
