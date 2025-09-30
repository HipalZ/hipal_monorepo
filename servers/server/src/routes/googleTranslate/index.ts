import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { TranslationServiceClient } from "@google-cloud/translate";

const googleCredsRaw = require("../../utils/googleTranslate.json");
const googleTranslateRoute = new Hono();

type SA = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
};

const googleCreds: SA | null = (googleCredsRaw as SA) ?? null;
console.log("Google Translate creds:", googleCreds);

// --- singleton client ---
let client: TranslationServiceClient;

function normalizePrivateKey(pk?: string) {
  // Google JSON often contains escaped newlines: replace \\n with \n
  return (pk ?? "").replace(/\\n/g, "\n");
}

function getClient() {
  if (client) return client;

  // 1) Highest priority: base64 creds in env
  if (Bun.env.GCP_CREDENTIALS_BASE64) {
    const parsed = JSON.parse(
      Buffer.from(Bun.env.GCP_CREDENTIALS_BASE64, "base64").toString("utf8"),
    ) as SA;

    client = new TranslationServiceClient({
      credentials: {
        ...parsed,
        private_key: normalizePrivateKey(parsed.private_key),
      },
      projectId: parsed.project_id,
    });
    return client;
  }

  // 2) Fallback: local googleTranslate.json
  if (googleCreds) {
    client = new TranslationServiceClient({
      credentials: {
        ...googleCreds,
        private_key: normalizePrivateKey(googleCreds.private_key),
      },
      projectId: googleCreds.project_id,
    });
    return client;
  }

  // 3) Last resort: GOOGLE_APPLICATION_CREDENTIALS file path
  client = new TranslationServiceClient();
  return client;
}

const PROJECT_ID = googleCreds?.project_id || "";
const LOCATION = "global";

// Keep WhatsApp-style placeholders like {{1}} intact
const protectPlaceholders = (text: string) =>
  text.replace(/\{\{\s*(\d+)\s*\}\}/g, "<ph_$1/>");
const restorePlaceholders = (text: string) =>
  text.replace(/<ph_(\d+)\/>/g, "{{$1}}");

// Request schema
const translateBodySchema = z.object({
  text: z.string().min(1).max(4000),
  target: z.string().min(2), // e.g. 'te','ta','hi','en'
  source: z.string().optional(), // optional source lang
});

googleTranslateRoute.post(
  "/",
  zValidator("json", translateBodySchema),
  async (c) => {
    try {
      if (!PROJECT_ID) {
        return c.json(
          { message: "GCLOUD project id missing", err: true, data: {} },
          500,
        );
      }

      const { text, target, source } = c.req.valid("json");
      const cli = getClient();

      const [resp] = await cli.translateText({
        parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
        contents: [protectPlaceholders(text.trim())],
        mimeType: "text/plain",
        targetLanguageCode: target.trim(),
        ...(source ? { sourceLanguageCode: source.trim() } : {}),
      });

      const translated = restorePlaceholders(
        resp.translations?.[0]?.translatedText ?? "",
      );

      return c.json(
        {
          message: "Translated successfully",
          err: false,
          data: { translated },
        },
        200,
      );
    } catch (err: any) {
      console.error("translate error:", err);
      return c.json(
        { message: err?.message || "translate failed", err: true, data: {} },
        500,
      );
    }
  },
);

export default googleTranslateRoute;
