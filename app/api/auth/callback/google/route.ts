/**
 * GET /api/auth/callback/google
 *
 * Google redirects here after the user grants permission.
 * This route:
 *  1. Receives the one-time authorization `code` from Google.
 *  2. Exchanges it for an access_token + refresh_token.
 *  3. Displays the refresh_token so you can copy it into .env as GOOGLE_REFRESH_TOKEN.
 *
 * ⚠️  This endpoint is for ONE-TIME SETUP only.
 *     After you save the refresh_token, this route is no longer needed for day-to-day operation.
 *
 * Make sure the following URL is added to your Authorized redirect URIs in Google Cloud Console:
 *   - http://localhost:3000/api/auth/callback/google   (local dev)
 *   - https://vivazen.in/api/auth/callback/google      (production)
 */

import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/googleAuth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // ── Google denied access or user cancelled ─────────────────────────────────
  if (error) {
    return NextResponse.json(
      { error: "Google OAuth denied", details: error },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code received from Google." },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      // This happens if the user already granted access before and prompt=consent was skipped.
      // Solution: Revoke access at https://myaccount.google.com/permissions and redo the flow.
      return NextResponse.json({
        warning:
          "No refresh_token received. This usually means this Google account already authorized the app. " +
          "Revoke access at https://myaccount.google.com/permissions and visit /api/auth/google/init again.",
        access_token_received: !!tokens.access_token,
      });
    }

    // ── SUCCESS — display tokens for one-time copy ─────────────────────────
    // In production you'd persist refresh_token to your DB here instead.
    // For now, copy it from the server console or this response, then add to .env.
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ Google OAuth SUCCESS — copy REFRESH_TOKEN below          ║");
    console.log("╠══════════════════════════════════════════════════════════════╣");
    console.log("║  GOOGLE_REFRESH_TOKEN =", tokens.refresh_token);
    console.log("╚══════════════════════════════════════════════════════════════╝");

    return NextResponse.json({
      success: true,
      message:
        "✅ OAuth successful! Copy the refresh_token below and paste it into your .env file as GOOGLE_REFRESH_TOKEN. " +
        "The access_token is also printed to the server console.",
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_in_seconds: tokens.expires_in,
      next_step:
        "Paste GOOGLE_REFRESH_TOKEN=<value> into your .env file, then restart the dev server.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[OAuth Callback] Token exchange error:", message);
    return NextResponse.json(
      { error: "Token exchange failed", details: message },
      { status: 500 }
    );
  }
}
