const admin = require("firebase-admin");

type FirebaseServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
  [key: string]: unknown;
};

let cachedServiceAccount: FirebaseServiceAccount | undefined;

export const getFirebaseServiceAccount = (): FirebaseServiceAccount => {
  if (cachedServiceAccount) return cachedServiceAccount;

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  const raw = encoded
    ? Buffer.from(encoded, "base64").toString("utf8")
    : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error(
      "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64.",
    );
  }

  try {
    const serviceAccount = JSON.parse(raw) as FirebaseServiceAccount;

    if (
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      throw new Error("Required service-account fields are missing.");
    }

    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    cachedServiceAccount = serviceAccount;
    return serviceAccount;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Firebase Admin credentials are invalid: ${message}`);
  }
};

export const getFirebaseAdmin = () => {
  if (!admin.apps?.length) {
    admin.initializeApp({
      credential: admin.credential.cert(getFirebaseServiceAccount()),
    });
  }

  return admin;
};

export const getFirebaseMessaging = () => getFirebaseAdmin().messaging();
