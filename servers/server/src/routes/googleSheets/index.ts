import { Hono } from "hono";
import { google } from "googleapis";
import { GoogleAuthTokens } from "@hi/db-models/src/models/googleAuthToken";

const credentials = require("../../utils/credentials_oauth.json").web;
const { client_id, client_secret, redirect_uris } = credentials;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

// --------------------- UTIL ---------------------
async function getTokenRecord(businessId: string, sessionKey: string) {
  console.log("Fetching token record for:", { businessId, sessionKey });
  const data = await GoogleAuthTokens.findOne({ businessId, sessionKey });
  console.log("Fetched token record:", data);
  return data;
}

// --------------------- ROUTER ---------------------
const googleSheetsRouter = new Hono()

  /* 1️⃣ GET AUTH URL */
  .get("/auth/url", async (c) => {
    const businessId = c.req.query("businessId");
    const sessionKey = c.req.query("sessionKey");

    if (!businessId || !sessionKey) {
      return c.json(
        { err: true, message: "Missing businessId/sessionKey" },
        400,
      );
    }

    const state = JSON.stringify({ businessId, sessionKey });

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
      ],
      prompt: "consent",
      state,
    });

    return c.json({ url });
  })

  /* 2️⃣ OAUTH CALLBACK */
  .get("/auth/google/callback", async (c) => {
    try {
      const code = c.req.query("code");
      const stateRaw = c.req.query("state");
      console.log("OAuth Callback received code:", code);
      console.log("OAuth Callback received state:", stateRaw);
      console.log("redirect_uri", redirect_uris[0]);
      if (!code || !stateRaw) {
        return c.html("<h3>❌ Missing code or state.</h3>");
      }

      const { businessId, sessionKey } = JSON.parse(stateRaw);

      // 1️⃣ Exchange code for tokens
      const { tokens } = await oauth2Client.getToken({
        code,
        redirect_uri: redirect_uris[0],
        client_id,
        client_secret,
      });
      console.log("tokens received:", tokens);
      // 2️⃣ Set credentials EXACTLY AS GOOGLE EXPECTS
      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope,
      });

      // 3️⃣ Check if a record already exists
      let existing = await GoogleAuthTokens.findOne({
        businessId,
        sessionKey,
      });

      if (!existing) {
        // 4️⃣ CREATE new entry
        existing = await GoogleAuthTokens.create({
          businessId,
          sessionKey,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          scope: tokens.scope,
          token_type: tokens.token_type,
        });
      } else {
        existing.access_token = tokens.access_token;
        existing.refresh_token = tokens.refresh_token ?? existing.refresh_token;
        existing.expiry_date = tokens.expiry_date ?? existing.expiry_date;
        existing.scope = tokens.scope ?? existing.scope;
        existing.token_type = tokens.token_type ?? existing.token_type;
        await existing.save();
      }

      // 6️⃣ popup message
      return c.html(`
      <h2>✅ Google connected successfully!</h2>
      <button id="continueBtn">Continue</button>
      <script>
        document.getElementById('continueBtn').onclick = () => window.close();
      </script>
    `);
    } catch (err: any) {
      console.error("OAuth Error:", err);
      return c.html(`<h3>Error: ${err.message}</h3>`);
    }
  })

  /* 3️⃣ CHECK LOGIN STATUS */
  .get("/status", async (c) => {
    const businessId = c.req.query("businessId");
    const sessionKey = c.req.query("sessionKey");
    console.log("/status called with:", { businessId, sessionKey });
    if (!businessId || !sessionKey) {
      return c.json({ loggedIn: false });
    }
    console.log("triggering status check for:", { businessId, sessionKey });
    const doc = await getTokenRecord(businessId, sessionKey);
    return c.json({ loggedIn: !!doc });
  })

  /* 4️⃣ LIST SPREADSHEETS */
  .get("/sheets", async (c) => {
    try {
      const businessId = c.req.query("businessId");
      const sessionKey = c.req.query("sessionKey");
      console.log("triggering sheets check for:", { businessId, sessionKey });
      const tokenDoc: any = await getTokenRecord(businessId, sessionKey);

      if (!tokenDoc?.access_token && !tokenDoc?.refresh_token) {
        return c.json({ err: true, message: "No saved Google tokens" }, 401);
      }

      // 🟢 Pass ONLY valid token fields
      oauth2Client.setCredentials({
        access_token: tokenDoc.access_token,
        refresh_token: tokenDoc.refresh_token,
        expiry_date: tokenDoc.expiry_date,
        token_type: tokenDoc.token_type,
        scope: tokenDoc.scope,
      });

      const drive = google.drive({ version: "v3", auth: oauth2Client });

      const result = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: "files(id, name)",
      });

      return c.json({ err: false, data: result.data.files });
    } catch (err: any) {
      console.error("Sheets error:", err);
      return c.json({ err: true, message: err.message }, 500);
    }
  })

  /* 5️⃣ LIST TABS */
  .get("/sheets/:id/tabs", async (c) => {
    try {
      const businessId = c.req.query("businessId");
      const sessionKey = c.req.query("sessionKey");
      console.log("triggering /sheets/:id/tabs check for:", {
        businessId,
        sessionKey,
      });
      const tokenDoc = await getTokenRecord(businessId, sessionKey);
      console.log("tokenDoc", tokenDoc);
      if (!tokenDoc)
        return c.json({ err: true, message: "Not authorized" }, 401);

      oauth2Client.setCredentials({
        access_token: tokenDoc.access_token,
        refresh_token: tokenDoc.refresh_token,
        expiry_date: tokenDoc.expiry_date,
        token_type: tokenDoc.token_type,
        scope: tokenDoc.scope,
      });

      const { id } = c.req.param();
      const sheets = google.sheets({ version: "v4", auth: oauth2Client });
      const meta = await sheets.spreadsheets.get({ spreadsheetId: id });

      const tabNames = meta.data.sheets?.map((s) => s.properties?.title) || [];
      return c.json({ err: false, data: tabNames });
    } catch (err: any) {
      return c.json({ err: true, message: err.message }, 500);
    }
  })

  /* 6️⃣ APPEND ROW */
  .post("/submit", async (c) => {
    try {
      const { businessId, sessionKey, spreadsheetId, range, values } =
        await c.req.json();
      console.log("triggering /submit", {
        businessId,
        sessionKey,
      });
      const tokenDoc = await getTokenRecord(businessId, sessionKey);
      if (!tokenDoc) return c.json({ success: false, error: "Not logged in" });

      oauth2Client.setCredentials({
        access_token: tokenDoc.access_token,
        refresh_token: tokenDoc.refresh_token,
        expiry_date: tokenDoc.expiry_date,
        token_type: tokenDoc.token_type,
        scope: tokenDoc.scope,
      });

      const sheets = google.sheets({ version: "v4", auth: oauth2Client });

      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: range || "Sheet1!A1",
        valueInputOption: "USER_ENTERED",
        resource: { values },
      });

      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message });
    }
  });
export default googleSheetsRouter;
