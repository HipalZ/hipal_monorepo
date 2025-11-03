import { google } from "googleapis";
import creds from "../../src/utils/service_account.json" assert {
  type: "json",
};

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: creds.client_email,
    private_key: creds.private_key.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

(async () => {
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: "13UZJ6oxnhiiN9apIRkMivN1yFaImNVI3iTHbB5OLYQ8",
    });
    console.log("✅ SUCCESS:", res.data.properties?.title);
  } catch (err: any) {
    console.error("❌ ERROR:", err.message);
  }
})();
