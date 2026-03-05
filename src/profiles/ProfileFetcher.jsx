// src/profiles/ProfileFetcher.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axiosSecure from "../components/utils/axiosSecure";
import { setActiveProfileData, clearActiveProfileData } from "../redux/slices/userSlice";

import EntrepreneurProfile from "./entrepreneur";
import ExpertProfile from "./expertProfile";
import NormalProfile from "./normalProfile";
import InvestorProfile from "./investorProfile";

export default function ProfileFetcher() {
  const dispatch = useDispatch();
  const { username: routeParam } = useParams();
  const loggedUser = useSelector((state) => state.user.data);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolvedParam = routeParam || loggedUser?.uuid || loggedUser?.username;
  const isSelfByUuid = loggedUser && (
    !routeParam ||
    loggedUser.uuid === routeParam ||
    loggedUser.username === routeParam
  );

  useEffect(() => {
    if (isSelfByUuid) return; // Bypass if it's our own mapped UUID

    dispatch(clearActiveProfileData());
    fetchProfile();

    return () => {
      dispatch(clearActiveProfileData());
    };
  }, [resolvedParam, dispatch, isSelfByUuid]);

  const fetchProfile = async () => {
    if (!resolvedParam) {
      setError("Profile not found or you are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axiosSecure.get(
        `/v1/auth/profiles/${resolvedParam}/`
      );

      setProfileData(res.data);
      dispatch(setActiveProfileData(res.data));
    } catch (err) {
      console.error("Profile fetch failed", err);
      setError(
        err?.response?.status === 500
          ? "Profile service is temporarily unavailable."
          : "Profile not found."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSelfByUuid) {
    const role = loggedUser.user_type;
    const commonProps = { readOnly: false, disableSelfFetch: false };

    if (role === "expert") return <ExpertProfile {...commonProps} />;
    if (role === "entrepreneur") return <EntrepreneurProfile {...commonProps} />;
    if (role === "investor") return <InvestorProfile {...commonProps} />;
    return <NormalProfile {...commonProps} />;
  }

  if (loading) {
    return (
      <div className="mt-20 text-center">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="mt-20 text-center">
        Profile not available
      </div>
    );
  }

  const { role, profile } = profileData;

  const profileUsername =
    profile?.user?.username || profile?.username;

  const isOwnProfile =
    loggedUser?.username === profileUsername;

  const commonProps = {
    profile,
    readOnly: !isOwnProfile,
    disableSelfFetch: true,
  };

  if (role === "expert") {
    return <ExpertProfile {...commonProps} />;
  }

  if (role === "entrepreneur") {
    return <EntrepreneurProfile {...commonProps} />;
  }

  if (role === "investor") {
    return <InvestorProfile {...commonProps} />;
  }

  return <NormalProfile {...commonProps} />;
}
