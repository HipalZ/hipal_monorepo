import axios from "axios";

export async function exchangeCodeForToken(
  c: any,
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string,
) {
  const url = `https://api.instagram.com/oauth/access_token`;

  const formData = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code: code,
  });

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return c.json({
      success: true,
      data: response.data,
    });
  } catch (err: any) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    return c.json(
      {
        error: "Failed to exchange authorization code",
        details: err.response?.data || err.message,
      },
      400,
    );
  }
}
