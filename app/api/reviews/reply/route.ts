/**
 * POST /api/reviews/reply
 *
 * Webhook / API endpoint to post a reply to a Google Business Profile review.
 * Uses the refresh_token stored in .env (GOOGLE_REFRESH_TOKEN) to auto-mint
 * a fresh access_token — no manual token management needed.
 *
 * Request body (JSON):
 * {
 *   reviewId:    string  — The Google review ID (e.g. "AbFvOqkXYZ...")
 *   replyText:   string  — The text reply to post
 *   refreshToken?: string — Optional: override the .env refresh token (e.g. from DB)
 * }
 *
 * This route is called by the VivaZen admin dashboard or CRM automation.
 */

import { NextResponse } from "next/server";
import { postGoogleReviewReply } from "@/lib/googleAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, replyText, refreshToken } = body as {
      reviewId?: string;
      replyText?: string;
      refreshToken?: string;
    };

    // ── Validate input ─────────────────────────────────────────────────────
    if (!reviewId || typeof reviewId !== "string" || reviewId.trim() === "") {
      return NextResponse.json(
        { error: "reviewId is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (!replyText || typeof replyText !== "string" || replyText.trim() === "") {
      return NextResponse.json(
        { error: "replyText is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // ── Post the reply via Google Business Profile API ─────────────────────
    const result = await postGoogleReviewReply(
      reviewId.trim(),
      replyText.trim(),
      refreshToken // falls back to process.env.GOOGLE_REFRESH_TOKEN internally
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to post reply to Google Business Profile", details: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reply posted successfully to Google Business Profile.",
      data: result.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/reviews/reply] Unhandled error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
