const whatsAppApiBaseUrl = {
  BASE_URL: "https://graph.facebook.com/",
};

export default whatsAppApiBaseUrl;

// ─── META API KILL SWITCH ──────────────────────────────────────────────────
// Set to `true` to pause ALL outbound traffic to graph.facebook.com from the
// server. Used while the WhatsApp Business Account / Tech Provider account is
// under Meta review so no further dispatch reaches them.
//
// What this does when ON:
//   1. All customer-facing routes that would hit Meta (template send / create /
//      edit / delete, sandbox /send, media-upload, send-messages, campaigns,
//      analytics) short-circuit with a clean 503 — no axios call fires.
//   2. The queue worker (`sendTemplate`) skips the upstream POST.
//   3. A global axios request interceptor (installed in `src/index.ts`) blocks
//      ANY request whose URL hits graph.facebook.com — safety net for code
//      paths we may have missed.
//
// To re-enable:
//   • Flip this to `false`.
//   • Restart the server (and worker if separate).
//   • Roll the frontend (the WhatsApp pages also gate the UI on a static
//     `WHATSAPP_UNDER_REVIEW` flag — see `clients/.../configs`).
export const WHATSAPP_META_PAUSED = true;

export const META_PAUSED_MESSAGE =
  "Your WhatsApp Account service is currently under review by Meta. Please contact the administration team for assistance with upgrading your account version to ensure security and policy compliance";

/**
 * Convenience guard for queue workers / non-Hono call sites. Throws when the
 * kill switch is on so the caller's try/catch surfaces a clean failure.
 */
export const guardMetaPaused = () => {
  if (WHATSAPP_META_PAUSED) {
    const err: Error & { code?: string } = new Error(META_PAUSED_MESSAGE);
    err.code = "WHATSAPP_META_PAUSED";
    throw err;
  }
};
