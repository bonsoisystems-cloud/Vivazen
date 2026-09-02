/**
 * Vivazen Beauty Salon — Gemini AI Review Intelligence & Google Business Profile Dispatcher
 * Inspired by engage-ap multi-model & tool-calling architecture.
 */

import { query } from "@/lib/db";
import { postGoogleReviewReply } from "@/lib/googleAuth";

// ─── 1. Types & Interfaces ───────────────────────────────────────────────────

export interface GoogleReviewItem {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  relativeTime?: string;
  replyText?: string;
  repliedAt?: string;
  repliedBy?: string;
  source?: string;
}

export interface ReviewReplyToolOutput {
  review_id: string;
  client_name: string;
  rating: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  reply_comment: string;
  requires_bill_verification: boolean;
  priority: "HIGH" | "NORMAL";
}

// ─── 2. Gemini Function Tool Declarations ────────────────────────────────────

export const googleReviewReplyToolDeclaration = {
  name: "publish_google_review_reply",
  description: "Formulate and publish a structured, authentic luxury response to a Google Business Profile review.",
  parameters: {
    type: "OBJECT",
    properties: {
      review_id: {
        type: "STRING",
        description: "The unique identifier of the review being replied to.",
      },
      client_name: {
        type: "STRING",
        description: "The name of the reviewer or guest.",
      },
      rating: {
        type: "INTEGER",
        description: "Star rating from 1 to 5.",
      },
      sentiment: {
        type: "STRING",
        enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
        description: "Sentiment analysis of the customer feedback.",
      },
      reply_comment: {
        type: "STRING",
        description: "The crafted luxury reply message. MUST be concise (maximum 30 to 40 words only).",
      },
      requires_bill_verification: {
        type: "BOOLEAN",
        description: "True if rating is <= 3 stars and requires bill verification to investigate and resolve.",
      },
      priority: {
        type: "STRING",
        enum: ["HIGH", "NORMAL"],
        description: "High priority for negative (<=3 star) reviews needing manager escalation.",
      },
    },
    required: ["review_id", "client_name", "rating", "sentiment", "reply_comment", "requires_bill_verification"],
  },
};

// ─── 3. Gemini Multi-Model Dispatcher ────────────────────────────────────────

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite-preview-02-05",
];

export class GeminiReviewAgent {
  /**
   * Generates a tailored review response using Gemini with tool-calling capabilities
   */
  static async generateReply(review: {
    id: string;
    authorName: string;
    rating: number;
    text: string;
  }): Promise<ReviewReplyToolOutput> {
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GOOGLE_AI_API_KEY,
      process.env.GOOGLE_API_KEY,
    ].filter(Boolean) as string[];

    const isLowRating = Number(review.rating) <= 3;
    const clientName = review.authorName || "Guest";

    const systemPrompt = `You are the Luxury Salon Concierge at VivaZen Salon & Spa, Jaunpur.
Analyze the following client review and invoke the function "publish_google_review_reply".

STRICT RULES:
1. Length: MAXIMUM 30 to 40 words only. Be concise, polite, and elegant.
2. Tone: Warm luxury, empathetic, gracious, professional.
${
  isLowRating
    ? `3. LOW RATING (<=3 Stars):
   - Express sincere empathy and regret for their experience.
   - Explicitly state: "At VivaZen, your happiness and genuine satisfaction matter far more than money."
   - Politely ask for their bill number or visit date so salon management can personally investigate and resolve it immediately.
   - Set requires_bill_verification = true, sentiment = "NEGATIVE", priority = "HIGH".`
    : `3. HIGH RATING (4-5 Stars):
   - Deliver the warmest, most gracious appreciation acknowledging their visit and kind words.
   - Set requires_bill_verification = false, sentiment = "POSITIVE", priority = "NORMAL".`
}
4. You MUST call the "publish_google_review_reply" function with the structured arguments.`;

    // Try calling Gemini with function calling across available keys & models
    for (const apiKey of apiKeys) {
      for (const model of GEMINI_MODELS) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\nReview ID: "${review.id}"\nClient: "${clientName}"\nRating: ${review.rating}/5 Stars\nReview Text: "${review.text}"`,
                    },
                  ],
                },
              ],
              tools: [
                {
                  functionDeclarations: [googleReviewReplyToolDeclaration],
                },
              ],
              toolConfig: {
                functionCallingConfig: {
                  mode: "ANY",
                  allowedFunctionNames: ["publish_google_review_reply"],
                },
              },
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 200,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const call = data?.candidates?.[0]?.content?.parts?.[0]?.functionCall;

            if (call && call.name === "publish_google_review_reply" && call.args) {
              const args = call.args as ReviewReplyToolOutput;
              return {
                review_id: review.id,
                client_name: args.client_name || clientName,
                rating: Number(args.rating || review.rating),
                sentiment: args.sentiment || (isLowRating ? "NEGATIVE" : "POSITIVE"),
                reply_comment: (args.reply_comment || "").replace(/^["']|["']$/g, "").trim(),
                requires_bill_verification: Boolean(args.requires_bill_verification ?? isLowRating),
                priority: args.priority || (isLowRating ? "HIGH" : "NORMAL"),
              };
            }
          }
        } catch (err) {
          console.warn(`[GeminiReviewAgent] Attempt on ${model} failed, trying fallback...`, err);
        }
      }
    }

    // Contextual Fallback if API keys are unavailable (adheres to 30-40 words rule)
    const firstName = clientName.split(" ")[0];
    if (isLowRating) {
      return {
        review_id: review.id,
        client_name: clientName,
        rating: review.rating,
        sentiment: "NEGATIVE",
        reply_comment: `Dear ${firstName}, we are truly sorry for your experience. At VivaZen, your happiness and genuine satisfaction matter far more than money. Please share your bill number with us at +91 76170 79955 so we can promptly resolve this for you.`,
        requires_bill_verification: true,
        priority: "HIGH",
      };
    } else {
      return {
        review_id: review.id,
        client_name: clientName,
        rating: review.rating,
        sentiment: "POSITIVE",
        reply_comment: `Thank you so much ${firstName} for your wonderful review! We are delighted that you enjoyed your luxury experience at VivaZen. Looking forward to pampering you with our bespoke rituals again soon!`,
        requires_bill_verification: false,
        priority: "NORMAL",
      };
    }
  }

  /**
   * Posts the reply directly to Google Business Profile API.
   * Automatically mints a fresh access_token using the stored GOOGLE_REFRESH_TOKEN
   * — no manual token rotation needed.
   */
  static async postToGoogleBusinessProfile(reviewId: string, replyComment: string) {
    const result = await postGoogleReviewReply(reviewId, replyComment);

    if (!result.success) {
      console.error("[GoogleBusinessProfile] Failed to post reply:", result.error);
    }

    return result;
  }

  /**
   * Saves the reply to the PostgreSQL database
   */
  static async saveReplyToDatabase(reviewId: string, replyComment: string, repliedBy = "VivaZen Concierge (Gemini AI)") {
    const rows = await query(
      `UPDATE "GoogleReview"
       SET "replyText" = $1,
           "repliedAt" = NOW(),
           "repliedBy" = $2,
           "updatedAt" = NOW()
       WHERE id = $3
       RETURNING *`,
      [replyComment, repliedBy, reviewId]
    );
    return rows[0] || null;
  }
}
