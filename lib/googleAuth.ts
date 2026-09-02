/**
 * VivaZen — Google OAuth2 Token Refresh Utility
 * Exchanges the stored refresh_token for a fresh access_token (valid 1 hour).
 * Never exposes credentials to the browser — all server-side only.
 */

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

// ─── 1. Refresh Token → Access Token ─────────────────────────────────────────

/**
 * Uses the long-lived refresh_token to get a fresh short-lived access_token.
 * @param storedRefreshToken - The refresh_token saved from the one-time OAuth flow.
 *                             Defaults to process.env.GOOGLE_REFRESH_TOKEN if omitted.
 */
export async function getFreshAccessToken(storedRefreshToken?: string): Promise<string> {
  const refreshToken = storedRefreshToken || process.env.GOOGLE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error(
      "[googleAuth] GOOGLE_REFRESH_TOKEN is not set. " +
      "Complete the one-time OAuth flow at /api/auth/google/init to obtain a refresh token."
    );
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`[googleAuth] Token refresh failed: ${data.error_description || data.error}`);
  }

  return data.access_token as string; // Valid for ~1 hour
}

// ─── 2. Post Reply to Google Business Profile ─────────────────────────────────

/**
 * Posts a reply to a Google Business Profile review using a fresh access token.
 */
export async function postGoogleReviewReply(
  reviewId: string,
  replyText: string,
  refreshToken?: string
): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  const locationId =
    process.env.GOOGLE_BUSINESS_LOCATION_ID || process.env.GOOGLE_BUSINESS_PROFILE_ID;

  if (!accountId || !locationId) {
    return {
      success: false,
      error:
        "GOOGLE_BUSINESS_ACCOUNT_ID or GOOGLE_BUSINESS_LOCATION_ID is not set in .env",
    };
  }

  try {
    const accessToken = await getFreshAccessToken(refreshToken);

    // Strip any existing 'accounts/' or 'locations/' prefixes to avoid double-prefixing
    const cleanAccount = accountId.replace(/^accounts\//, "");
    const cleanLocation = locationId.replace(/^locations\//, "");

    const url = `https://mybusiness.googleapis.com/v4/accounts/${cleanAccount}/locations/${cleanLocation}/reviews/${reviewId}/reply`;

    const googleRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: replyText }),
    });

    if (googleRes.ok) {
      const data = await googleRes.json();
      return { success: true, data };
    }

    const errorData = await googleRes.json().catch(() => ({}));
    console.error("[googleAuth] Google Business Profile API Error:", errorData);
    return { success: false, error: errorData };
  } catch (err) {
    console.error("[googleAuth] postGoogleReviewReply error:", err);
    return { success: false, error: String(err) };
  }
}

// ─── 3. Build the OAuth2 Authorization URL (used for one-time setup) ──────────

/**
 * Generates the Google consent URL. Open this in a browser to start the OAuth flow.
 * Scopes required for Google Business Profile review management.
 */
export function getGoogleOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/business.manage",
    ].join(" "),
    access_type: "offline",   // CRITICAL: required to get a refresh_token
    prompt: "consent",        // CRITICAL: forces Google to re-issue refresh_token every time
  });

  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}

// ─── 4. Exchange Auth Code → Tokens (used in callback route) ─────────────────

/**
 * Exchanges the one-time authorization code (from the OAuth callback) for
 * an access_token and a refresh_token.
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(
      `[googleAuth] Code exchange failed: ${data.error_description || data.error}`
    );
  }

  return data;
}
