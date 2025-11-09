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
let tokensCache = null;

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
  console.log("called /auth/google/callback", c);
  const code = c.req.query("code");
  console.log("OAuth callback received code:", code);

  const { tokens } = await oauth2Client.getToken(code);
  console.log("Obtained tokens:", tokens);
  tokensCache = tokens;
  oauth2Client.setCredentials(tokens);

  // optional: close popup instead of redirect
  return c.html(`
    <script>
      window.opener.postMessage({ success: true }, "*");
      window.close();
    </script>
    <h3>✅ Google login successful!</h3>
  `);
});

/* ----------------------------------------------------------------------------
 * 2️⃣  Handle OAuth code exchange (popup callback)
 * -------------------------------------------------------------------------- */
googleSheetsRouter.post("/auth/exchange", async (c) => {
  try {
    const { code } = await c.req.json();
    if (!code)
      return c.json({ message: "Missing code", err: true, data: {} }, 400);

    const { tokens } = await oauth2Client.getToken(code);
    oauthTokensCache = tokens;
    oauth2Client.setCredentials(tokens);

    return c.json({
      message: "Login successful",
      err: false,
      data: { authorized: true },
    });
  } catch (err: any) {
    return c.json({ message: err.message, err: true, data: {} }, 500);
  }
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
export default googleSheetsRouter;
