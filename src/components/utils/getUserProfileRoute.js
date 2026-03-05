// src/components/utils/getUserProfileRoute.js
// Single source of truth for mapping user_type → profile route.
// Add new user types here — they'll be reflected everywhere automatically.

/**
 * Returns the profile route for a given user_type.
 * Used by Navbar, Home, SearchResultsPage, and any future page.
 */
export const getOwnProfileRoute = (userType, username) => {
  const postfix = username ? `/${username}` : "";
  // Admins still have their own separated dashboards
  if (userType === "admin") return "/admin";
  if (userType === "superadmin") return "/superadmin";

  // Everyone else goes to their unified profile page with their username
  return `/profile${postfix}`;
};

/**
 * Resolves where to navigate when a user clicks on a profile card.
 * - If it's the logged-in user's own profile → go to their own profile page
 * - If no logged-in user, or it's someone else → go to /profile/:username
 *
 * @param {object} author       - The post/card author { username, user_type, ... }
 * @param {object|null} loggedUser  - Current logged-in user from Redux
 * @returns {string}            - The route to navigate to
 */
export const resolveProfileRoute = (author, loggedUser) => {
  if (!author) return "/";

  if (!loggedUser || loggedUser.username !== author.username) {
    // Prioritize username for cleaner URLs
    return `/profile/${author.username || author.uuid}`;
  }
  return getOwnProfileRoute(loggedUser.user_type, loggedUser.username);
};
