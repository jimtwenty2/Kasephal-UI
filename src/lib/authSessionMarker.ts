export const AUTH_SESSION_MARKER_KEY = "kasephal.auth.session";

export function setAuthSessionMarker() {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AUTH_SESSION_MARKER_KEY, "active");
}

export function clearAuthSessionMarker() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_SESSION_MARKER_KEY);
}

export function hasAuthSessionMarker() {
  if (typeof window === "undefined") return true;

  return window.localStorage.getItem(AUTH_SESSION_MARKER_KEY) === "active";
}
