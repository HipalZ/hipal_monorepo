export const HOTEL_SESSION_EXPIRED_EVENT = "hipal:hotel-session-expired";

export const showHotelSessionExpired = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HOTEL_SESSION_EXPIRED_EVENT));
};

/**
 * The hotel guest APIs return 403 when the acting user is no longer a current
 * occupant of the room (checked out, or a stale session-less link). Keep the
 * guest on the same page and block further access with a session-expired popup.
 *
 * The mutation hooks return `response.json()` without checking status, so a 403
 * would otherwise resolve into onSuccess. Call this right after the request and
 * throw when it returns true so onSuccess does not run.
 *
 * Returns true if the session was out (caller should stop).
 */
export const expelIfSessionOut = (
  response: { status: number },
  _router?: { push: (href: string) => void }
): boolean => {
  if (response.status === 403) {
    showHotelSessionExpired();
    return true;
  }
  return false;
};
