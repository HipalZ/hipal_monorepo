import toast from "react-hot-toast";

/**
 * The hotel guest APIs return 403 when the acting user is no longer a current
 * occupant of the room (checked out, or a stale session-less link). In that
 * case expel the guest to the landing page with a "session out" message.
 *
 * The mutation hooks return `response.json()` without checking status, so a 403
 * would otherwise resolve into onSuccess. Call this right after the request and
 * throw when it returns true so onSuccess does not run.
 *
 * Returns true if the session was out (caller should stop).
 */
export const expelIfSessionOut = (
  response: { status: number },
  router: { push: (href: string) => void }
): boolean => {
  if (response.status === 403) {
    toast.error("Session expired. Please check in again.");
    router.push("/");
    return true;
  }
  return false;
};
