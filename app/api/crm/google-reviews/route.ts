import { NextRequest, NextResponse } from "next/server";
import { query, initCrmTables } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

// Fetch fresh real reviews directly from Google Places API if credentials are provided in .env
async function fetchFreshFromGooglePlaces() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || process.env.GOOGLE_BUSINESS_PLACE_ID;

  if (!apiKey || !placeId) {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (res.ok) {
      const data = await res.json();
      if (data.status === "OK" && data.result?.reviews) {
        // Sync fresh reviews into database
        for (const rev of data.result.reviews) {
          const revId = `g_${rev.author_url ? rev.author_url.split("/").pop() : ""}_${rev.time}`.slice(0, 50) || `gr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          await query(
            `INSERT INTO "GoogleReview" (
              id, "authorName", "authorPhoto", rating, text, "relativeTime", "source", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, 'Google Places API', NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET
              "rating" = EXCLUDED.rating,
              "text" = EXCLUDED.text,
              "relativeTime" = EXCLUDED."relativeTime",
              "updatedAt" = NOW()`,
            [
              revId,
              rev.author_name || "Google Reviewer",
              rev.profile_photo_url || null,
              Number(rev.rating || 5),
              rev.text || "",
              rev.relative_time_description || "Recently"
            ]
          );
        }
        return data.result.reviews;
      }
    }
  } catch (err) {
    console.error("Error fetching fresh reviews from Google Places API:", err);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    await initCrmTables();

    // Check for fresh Google Places API fetch
    await fetchFreshFromGooglePlaces();

    const { searchParams } = new URL(request.url);
    const minRating = searchParams.get("rating");
    const isPublic = searchParams.get("public") === "true";

    let sql = `SELECT * FROM "GoogleReview"`;
    const conditions: string[] = [];
    const params: any[] = [];

    if (minRating) {
      params.push(Number(minRating));
      conditions.push(`rating >= $${params.length}`);
    }

    if (isPublic) {
      conditions.push(`"isPublishedOnWeb" = true`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ` ORDER BY rating DESC, "createdAt" DESC`;

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching Google Reviews from database:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { authorName, authorPhoto, rating, text, relativeTime, isPublishedOnWeb } = body;

    if (!authorName || !text) {
      return NextResponse.json({ error: "Author name and review text are required" }, { status: 400 });
    }

    const id = `gr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const rows = await query(
      `INSERT INTO "GoogleReview" (
        id, "authorName", "authorPhoto", rating, text, "relativeTime", "isPublishedOnWeb", "source", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Google Business Profile', NOW(), NOW())
      RETURNING *`,
      [
        id,
        authorName,
        authorPhoto || null,
        Number(rating || 5),
        text,
        relativeTime || "Recently",
        isPublishedOnWeb !== false
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating Google review:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await query(`DELETE FROM "GoogleReview" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Google review deleted" });
  } catch (err) {
    console.error("Error deleting Google review:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
