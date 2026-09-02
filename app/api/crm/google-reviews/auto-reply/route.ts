import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { GeminiReviewAgent } from "@/lib/gemini-review-agent";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { reviewId, authorName, rating, text, autoPublish, bulkAll } = body;

    // ─── 1. Bulk Auto-Reply Handler ─────────────────────────────────────────
    if (bulkAll) {
      const unanswered = await query(
        `SELECT * FROM "GoogleReview" WHERE "replyText" IS NULL OR "replyText" = '' ORDER BY "createdAt" DESC`
      );

      const results = [];
      for (const rev of unanswered) {
        // Generate with Gemini tool calling
        const toolOutput = await GeminiReviewAgent.generateReply({
          id: rev.id,
          authorName: rev.authorName || "Guest",
          rating: Number(rev.rating || 5),
          text: rev.text || "",
        });

        // Save reply in database
        await GeminiReviewAgent.saveReplyToDatabase(rev.id, toolOutput.reply_comment, "VivaZen Concierge (Gemini AI)");

        // Post live to Google Business Profile API
        const gmbResult = await GeminiReviewAgent.postToGoogleBusinessProfile(rev.id, toolOutput.reply_comment);

        results.push({
          id: rev.id,
          authorName: rev.authorName,
          rating: rev.rating,
          sentiment: toolOutput.sentiment,
          replyText: toolOutput.reply_comment,
          requiresBillVerification: toolOutput.requires_bill_verification,
          gmbResult,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed and replied to ${results.length} reviews using Gemini AI`,
        data: results,
      });
    }

    // ─── 2. Single Review AI Reply Handler ──────────────────────────────────
    let targetId = reviewId || `rev_${Date.now()}`;
    let targetAuthor = authorName || "Guest";
    let targetRating = Number(rating || 5);
    let targetText = text;

    if (reviewId) {
      const rows = await query(`SELECT * FROM "GoogleReview" WHERE id = $1`, [reviewId]);
      if (rows.length > 0) {
        const rev = rows[0];
        targetAuthor = rev.authorName || targetAuthor;
        targetRating = Number(rev.rating || targetRating);
        targetText = rev.text || targetText;
      }
    }

    if (!targetText) {
      return NextResponse.json({ error: "Review text is required for AI generation" }, { status: 400 });
    }

    // Call Gemini with function calling
    const toolOutput = await GeminiReviewAgent.generateReply({
      id: targetId,
      authorName: targetAuthor,
      rating: targetRating,
      text: targetText,
    });

    let gmbResult = null;
    if (autoPublish && reviewId) {
      await GeminiReviewAgent.saveReplyToDatabase(reviewId, toolOutput.reply_comment, "VivaZen Concierge (Gemini AI)");
      gmbResult = await GeminiReviewAgent.postToGoogleBusinessProfile(reviewId, toolOutput.reply_comment);
    }

    return NextResponse.json({
      success: true,
      data: {
        reviewId: targetId,
        authorName: targetAuthor,
        rating: targetRating,
        sentiment: toolOutput.sentiment,
        replyText: toolOutput.reply_comment,
        requiresBillVerification: toolOutput.requires_bill_verification,
        priority: toolOutput.priority,
        gmbResult,
      },
    });
  } catch (err) {
    console.error("Error in auto-reply endpoint:", err);
    return NextResponse.json({ error: "Failed to process auto-reply" }, { status: 500 });
  }
}
