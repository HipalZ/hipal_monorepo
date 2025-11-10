import { Hono } from "hono";
import { google } from "googleapis";

const googleSheetsRouter = new Hono();

// You’ll store tokens in memory for MVP (replace with DB later)
let oauthTokensCache: any = null;
const credentials = require("../../utils/credentials_oauth.json").web;
const { client_id, client_secret, redirect_uris } = credentials;

// 🔐 OAuth client
const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);
/* ----------------------------------------------------------------------------
 * 1️⃣  Get Google Auth URL (for popup window)
 * -------------------------------------------------------------------------- */
googleSheetsRouter.get("/auth/url", async (c) => {
  console.log("credentials", credentials);
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  console.log("Generated auth URL:", url);
  return c.json({ url });
});

googleSheetsRouter.get("/auth/google/callback", async (c) => {
  try {
    const code = c.req.query("code");
    if (!code) {
      return c.html("<h3>❌ Missing code.</h3>");
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauthTokensCache = tokens;
    oauth2Client.setCredentials(tokens);

    console.log("✅ Google login successful");

    // ✅ Just show success message (popup will be closed manually)
    return c.html(`
      <h2>✅ Google login successful!</h2>
      <script>
        // Flag for frontend polling
        fetch('/google_sheets/status', { method: 'POST', body: 'true' });
      </script>
    `);
  } catch (err: any) {
    return c.html(`<h3>❌ Error: ${err.message}</h3>`);
  }
});

/* ----------------------------------------------------------------------------
 * 3️⃣ Frontend will poll this to see if login is done
 * -------------------------------------------------------------------------- */
googleSheetsRouter.get("/status", async (c) => {
  return c.json({ loggedIn: !!oauthTokensCache });
});

/* ----------------------------------------------------------------------------
 * 3️⃣  List user spreadsheets
 * -------------------------------------------------------------------------- */
googleSheetsRouter.get("/sheets", async (c) => {
  try {
    if (!oauthTokensCache)
      return c.json({ message: "Not authorized", err: true, data: {} }, 401);

    oauth2Client.setCredentials(oauthTokensCache);
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const result = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name)",
    });
    return c.json({ err: false, data: result.data.files });
  } catch (err: any) {
    return c.json({ message: err.message, err: true, data: [] }, 500);
  }
});

/* ----------------------------------------------------------------------------
 * 4️⃣  List sheet tabs for selected spreadsheet
 * -------------------------------------------------------------------------- */
googleSheetsRouter.get("/sheets/:id/tabs", async (c) => {
  try {
    if (!oauthTokensCache)
      return c.json({ message: "Not authorized", err: true, data: {} }, 401);

    const { id } = c.req.param();
    oauth2Client.setCredentials(oauthTokensCache);
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: id });
    const sheetNames = meta.data.sheets?.map((s) => s.properties?.title) || [];
    return c.json({ err: false, data: sheetNames });
  } catch (err: any) {
    return c.json({ message: err.message, err: true, data: [] }, 500);
  }
});

googleSheetsRouter.get("/ping", (c) => c.text("Google Sheets Router alive ✅"));

googleSheetsRouter.post("/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { spreadsheetId, range, values } = body;

    if (!spreadsheetId || !values) {
      return c.json(
        { success: false, error: "Missing spreadsheetId or values" },
        400,
      );
    }

    if (!oauthTokensCache) {
      return c.json({ success: false, error: "Not logged in" }, 401);
    }

    oauth2Client.setCredentials(oauthTokensCache);
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    sheets.spreadsheets.values.append({
      spreadsheetId,
      range: range || "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.error("Submit error:", err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default googleSheetsRouter;
