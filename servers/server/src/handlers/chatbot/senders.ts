/* ============================================================================
 *  WHATSAPP SEND HELPERS (fully typed & cleaned)
 * ==========================================================================*/

export type ButtonSpec = {
  id: string;
  type: "reply";
  title: string;
};

export async function waSend(cfg: any, payload: any) {
  const phoneNumberId = String(cfg?.phoneId || "").trim();
  const token = String(cfg?.token || "").trim();

  if (!phoneNumberId) throw new Error("Missing phoneId");
  if (!token) throw new Error("Missing token");

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("[WA SEND ERROR]", res.status, text);
    throw new Error(`WA send failed ${res.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* ================================================================
 * TEXT
 * ================================================================ */
export async function sendText(to: string, text: string, cfg: any) {
  return waSend(cfg, {
    to,
    type: "text",
    text: { body: text, preview_url: false },
  });
}

/* ================================================================
 * MEDIA: IMAGE / VIDEO / DOCUMENT
 * ================================================================ */
export async function sendImage(
  to: string,
  link: string,
  caption: string | undefined,
  cfg: any,
) {
  return waSend(cfg, {
    to,
    type: "image",
    image: { link, ...(caption ? { caption } : {}) },
  });
}

export async function sendVideo(
  to: string,
  link: string,
  caption: string | undefined,
  cfg: any,
) {
  return waSend(cfg, {
    to,
    type: "video",
    video: { link, ...(caption ? { caption } : {}) },
  });
}

export async function sendDocument(
  to: string,
  link: string,
  filename: string | undefined,
  cfg: any,
) {
  return waSend(cfg, {
    to,
    type: "document",
    document: { link, ...(filename ? { filename } : {}) },
  });
}

/* ================================================================
 * INTERACTIVE BUTTON
 * ================================================================ */
export async function sendInteractiveButton(
  to: string,
  bodyText: string,
  footerText: string | undefined,
  buttons: ButtonSpec[],
  header: any | undefined,
  cfg: any,
) {
  const actionButtons = buttons.map((b) => ({
    type: "reply",
    reply: { id: b.id, title: b.title },
  }));

  const interactive: any = {
    type: "button",
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: { buttons: actionButtons },
  };

  if (header?.type === "image" && header.image?.link) {
    interactive.header = { type: "image", image: { link: header.image.link } };
  }

  return waSend(cfg, { to, type: "interactive", interactive });
}

/* ================================================================
 * INTERACTIVE LIST
 * ================================================================ */
export async function sendInteractiveList(
  to: string,
  bodyText: string,
  footerText: string | undefined,
  list: {
    buttonText?: string;
    sections: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[];
  },
  cfg: any,
) {
  return waSend(cfg, {
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      ...(footerText ? { footer: { text: footerText } } : {}),
      action: {
        button: list.buttonText || "Choose",
        sections: list.sections.map((s) => ({
          title: s.title,
          rows: s.rows.map((r) => ({
            id: r.id,
            title: r.title,
            ...(r.description ? { description: r.description } : {}),
          })),
        })),
      },
    },
  });
}

/* ================================================================
 * CTA URL
 * ================================================================ */
export async function sendInteractiveCTAUrl(
  to: string,
  bodyText: string,
  footerText: string | undefined,
  url: string,
  label: string,
  header: any | undefined,
  cfg: any,
) {
  const interactive: any = {
    type: "cta_url",
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: {
      name: "cta_url",
      parameters: { display_text: label, url },
    },
  };

  if (header?.type === "image" && header.image?.link) {
    interactive.header = { type: "image", image: { link: header.image.link } };
  }

  return waSend(cfg, { to, type: "interactive", interactive });
}
