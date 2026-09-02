/**
 * GET /api/auth/google/find-account
 *
 * Helper route: lists all Google Business Profile accounts linked to your
 * authenticated Google account. Run this ONCE after enabling the API to
 * find your GOOGLE_BUSINESS_ACCOUNT_ID.
 *
 * Visit: http://localhost:3000/api/auth/google/find-account
 */

import { NextResponse } from "next/server";
import { getFreshAccessToken } from "@/lib/googleAuth";

export async function GET() {
  try {
    const accessToken = await getFreshAccessToken();

    // Fetch all Business Profile accounts
    const res = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch accounts",
          status: res.status,
          details: data,
          hint:
            res.status === 429
              ? "⚠️ The Google Business Profile API is NOT enabled for your project. Enable it at: https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com?project=ambient-odyssey-488905-t5"
              : "Check that the API is enabled and your account has access.",
        },
        { status: res.status }
      );
    }

    const accounts = data.accounts || [];

    if (accounts.length === 0) {
      return NextResponse.json({
        message: "No Business Profile accounts found for this Google account.",
        hint: "Make sure you signed in with the Google account that manages the VivaZen Business Profile.",
      });
    }

    // Extract clean IDs from the account names (format: "accounts/XXXXXXXXX")
    const formatted = accounts.map((a: { name: string; accountName: string; type: string; verificationState: string }) => ({
      accountName: a.accountName,
      type: a.type,
      verificationState: a.verificationState,
      fullName: a.name,
      // This is what you need for GOOGLE_BUSINESS_ACCOUNT_ID:
      GOOGLE_BUSINESS_ACCOUNT_ID: a.name.replace("accounts/", ""),
    }));

    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║  📋 Google Business Profile Accounts Found                   ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    formatted.forEach((a: { accountName: string; GOOGLE_BUSINESS_ACCOUNT_ID: string }) => {
      console.log(`  Account: ${a.accountName}`);
      console.log(`  GOOGLE_BUSINESS_ACCOUNT_ID = ${a.GOOGLE_BUSINESS_ACCOUNT_ID}`);
    });

    return NextResponse.json({
      success: true,
      message: "✅ Copy the GOOGLE_BUSINESS_ACCOUNT_ID value below into your .env file.",
      accounts: formatted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
