import { google } from "googleapis";
import fs from "fs";
import path from "path";

const SERVICE_ACCOUNT_PATH = path.resolve("./service-account.json");

export async function connectGoogleSheets() {
  const raw = fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8");
  const creds = JSON.parse(raw);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function appendToSheet({
  spreadsheetId,
  sheetName,
  rowValues,
}: {
  spreadsheetId: string;
  sheetName: string;
  rowValues: any[];
}) {
  const sheets = await connectGoogleSheets();
  const range = `${sheetName}!A1`;
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowValues] },
  });
  return res.data;
}
