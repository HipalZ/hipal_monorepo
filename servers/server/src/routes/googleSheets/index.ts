import { Hono } from "hono";
import { google } from "googleapis";

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
 * 1️⃣  Get Google Auth URL (Popup Window)
 * -------------------------------------------------------------------------- */
const googleSheetsRouter = new Hono()
  .get("/auth/url", async (c) => {
    const scopes = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });

    return c.json({ url });
  })

  /* ----------------------------------------------------------------------------
   * 2️⃣ OAuth Redirect → Get Code → Exchange Token
   * -------------------------------------------------------------------------- */
  .get("/auth/google/callback", async (c) => {
    try {
      const code = c.req.query("code");
      if (!code) return c.html("<h3>❌ Missing code.</h3>");

      const { tokens } = await oauth2Client.getToken(code);
      console.log("tokens", tokens);
      oauthTokensCache = tokens;
      oauth2Client.setCredentials(tokens);

      console.log("✅ Google login successful");

      return c.html(`
        <h2>✅ Google login successful!</h2>
        <button 
          id="continueBtn" 
          style="padding: 10px 20px; font-size: 15px; cursor: pointer;
                background: #4CAF50; color: white; border: none; border-radius: 6px;"
        >
          Continue
        </button>

        <script>
          document.getElementById('continueBtn').onclick = function() {
            fetch('/google_sheets/status', {
              method: 'POST',
              body: JSON.stringify({ ok: true }),
              headers: { 'Content-Type': 'application/json' }
            }).then(() => {
              window.close();
            });
          };
        </script>
      `);
    } catch (err: any) {
      return c.html(`
        <h3>❌ Error: ${err.message}</h3>
        <button 
          id="errorBtn" 
          style="padding: 10px 20px; font-size: 15px; cursor: pointer;
                background: red; color: white; border: none; border-radius: 6px;"
        >
          Close
        </button>

        <script>
          document.getElementById('errorBtn').onclick = function() {
            fetch('/google_sheets/status', {
              method: 'POST',
              body: JSON.stringify({ failed: true }),
              headers: { 'Content-Type': 'application/json' }
            }).then(() => {
              window.close();
            });
          };
        </script>
      `);
    }
  })

  /* ----------------------------------------------------------------------------
   * 3️⃣ Frontend Polling → Check Login
   * -------------------------------------------------------------------------- */
  .post("/status", async (c) => {
    const _ = await c.req.json();
    return c.json({ loggedIn: !!oauthTokensCache });
  })

  .get("/status", async (c) => {
    return c.json({ loggedIn: !!oauthTokensCache });
  })

  /* ----------------------------------------------------------------------------
   * 4️⃣ List User Spreadsheets
   * -------------------------------------------------------------------------- */
  .get("/sheets", async (c) => {
    try {
      if (!oauthTokensCache)
        return c.json({ err: true, message: "Not authorized" }, 401);

      oauth2Client.setCredentials(oauthTokensCache);
      const drive = google.drive({ version: "v3", auth: oauth2Client });

      const result = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: "files(id, name)",
      });

      return c.json({ err: false, data: result.data.files });
    } catch (err: any) {
      console.error("Google Sheets List Error:", err);
      return c.json({ err: true, message: err.message, data: [] }, 500);
    }
  })

  /* ----------------------------------------------------------------------------
   * 5️⃣ List Tabs Inside Spreadsheet
   * -------------------------------------------------------------------------- */
  .get("/sheets/:id/tabs", async (c) => {
    try {
      if (!oauthTokensCache)
        return c.json({ err: true, message: "Not authorized" }, 401);

      const { id } = c.req.param();
      oauth2Client.setCredentials(oauthTokensCache);

      const sheets = google.sheets({ version: "v4", auth: oauth2Client });
      const meta = await sheets.spreadsheets.get({ spreadsheetId: id });

      const sheetNames =
        meta.data.sheets?.map((s) => s.properties?.title) || [];

      return c.json({ err: false, data: sheetNames });
    } catch (err: any) {
      return c.json({ err: true, message: err.message, data: [] }, 500);
    }
  })

  /* ----------------------------------------------------------------------------
   * 6️⃣ Append Row to Google Sheet
   * -------------------------------------------------------------------------- */
  .post("/submit", async (c) => {
    try {
      const { spreadsheetId, range, values } = await c.req.json();

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

      // IMPORTANT FIX — you forgot `await`
      await sheets.spreadsheets.values.append({
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
  })

  .get("/ping", (c) => c.text("Google Sheets Router alive ✅"));

export default googleSheetsRouter;
