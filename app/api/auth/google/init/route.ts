/**
 * GET /api/auth/google/init
 *
 * One-time setup route. Open this URL in the browser while logged into the
 * Google account that manages the VivaZen Google Business Profile.
 * It redirects you to Google's consent page.
 *
 * After granting access, Google redirects to /api/auth/callback/google
 * with an authorization code, which is then exchanged for a refresh_token.
 */

import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/googleAuth";

export async function GET() {
  try {
    const authUrl = getGoogleOAuthUrl();
    // Redirect the browser to Google's consent screen
    return NextResponse.redirect(authUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to build Google OAuth URL", details: message },
      { status: 500 }
    );
  }
}
