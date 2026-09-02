import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { GeminiReviewAgent } from "@/lib/gemini-review-agent";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { reviewId, replyText, repliedBy } = body;

    if (!reviewId || !replyText || !replyText.trim()) {
      return NextResponse.json({ error: "Review ID and reply text are required" }, { status: 400 });
    }

    const responderName = repliedBy || session.name || "VivaZen Concierge";
    const cleanReply = replyText.trim();

    // 1. Update PostgreSQL database
    const saved = await GeminiReviewAgent.saveReplyToDatabase(reviewId, cleanReply, responderName);
    if (!saved) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // 2. Dispatch live to Google Business Profile API
    const gmbResult = await GeminiReviewAgent.postToGoogleBusinessProfile(reviewId, cleanReply);

    return NextResponse.json({
      success: true,
      message: "Reply saved and dispatched to Google Business Profile",
      data: saved,
      gmbResult,
    });
  } catch (err) {
    console.error("Error replying to Google review:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
