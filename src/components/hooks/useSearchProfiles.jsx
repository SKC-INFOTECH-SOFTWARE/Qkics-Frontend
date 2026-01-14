import { useState, useRef, useCallback } from "react";
import axios from "axios";
import axiosSecure from "../utils/axiosSecure";
import { getAccessToken } from "../../redux/store/tokenManager";
import { API_BASE_URL } from "../../config/api";

export default function useSearchProfiles() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const controllerRef = useRef(null);

  const searchProfiles = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      controllerRef.current = new AbortController();

      const token = getAccessToken();
      const client = token ? axiosSecure : axios;
      const prefix = token ? "/v1" : "/api/v1";

      const res = await client.get(
        `${prefix}/auth/search/?q=${encodeURIComponent(query)}`,
        { signal: controllerRef.current.signal }
      );

      const data = res.data?.results || res.data || [];
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("Profile search failed");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchProfiles, results, loading };
}
