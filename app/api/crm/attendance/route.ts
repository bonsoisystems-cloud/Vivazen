import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Robust helper to parse any time format (24h, 12h AM/PM, seconds) to total minutes from midnight
function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;
  const str = String(timeStr).trim();
  const match = str.match(/(\d{1,2}):(\d{1,2})(?::\d{1,2})?\s*(am|pm)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toLowerCase();

  if (period === "pm" && hours < 12) {
    hours += 12;
  } else if (period === "am" && hours === 12) {
    hours = 0;
  }

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function getExactCurrentTime(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (date) {
      const rows = await query(`SELECT * FROM "Attendance" WHERE date = $1 ORDER BY "inTime" ASC`, [date]);
      return NextResponse.json({ success: true, data: rows });
    }

    const rows = await query(`SELECT * FROM "Attendance" ORDER BY date DESC, "inTime" ASC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { staffId, staffName, type, date, inTime, outTime, status } = body;

    if (!staffId || !staffName) {
      return NextResponse.json({ error: "Staff ID and name required" }, { status: 400 });
    }

    // ─── 1. STAFF IDENTITY RESTRICTION ───
    // If logged in as STAFF, verify that they are only punching for their own profile
    if (session.role === "STAFF") {
      const matchedStaff = await query(
        `SELECT id FROM "ServiceProvider" WHERE LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($2)`,
        [session.email || "", session.name || ""]
      );

      const isOwnProfile = matchedStaff.some((st: any) => st.id === staffId);
      if (!isOwnProfile && matchedStaff.length > 0) {
        return NextResponse.json(
          { error: "Access Denied: Staff members can only mark their own attendance." },
          { status: 403 }
        );
      }
    }

    const aDate = date || new Date().toISOString().split("T")[0];
    const liveTime = getExactCurrentTime();
    const punchTime = outTime || inTime || liveTime;

    // Check existing attendance record for this staff on this date
    const existingRows = await query(
      `SELECT * FROM "Attendance" WHERE "staffId" = $1 AND date = $2`,
      [staffId, aDate]
    );

    if (existingRows.length > 0) {
      const existing = existingRows[0];

      // ─── 2. TWO-PUNCH LIMIT RULE: Both In-Time and Out-Time already recorded ───
      if (existing.outTime) {
        return NextResponse.json(
          {
            error: `Attendance for today is already completed (In-Time: ${existing.inTime}, Out-Time: ${existing.outTime}). Only two punches (In-Time and Out-Time) are allowed per day.`
          },
          { status: 400 }
        );
      }

      // If In-Time exists and user is punching Out-Time
      if (existing.inTime) {
        const inMinutes = parseTimeToMinutes(existing.inTime);
        const outMinutes = parseTimeToMinutes(punchTime);

        if (inMinutes !== null && outMinutes !== null) {
          const diffMinutes = outMinutes - inMinutes;

          // ─── 3. STRICT 1-HOUR (60 MINUTE) COOLDOWN ENFORCEMENT ───
          if (diffMinutes >= 0 && diffMinutes < 60) {
            const remainingMin = 60 - diffMinutes;
            const eligibleTotalMin = inMinutes + 60;
            const eligibleH = Math.floor(eligibleTotalMin / 60) % 24;
            const eligibleM = eligibleTotalMin % 60;
            const eligibleTimeStr = `${String(eligibleH).padStart(2, "0")}:${String(eligibleM).padStart(2, "0")}`;

            return NextResponse.json(
              {
                error: `Out-Time Restricted: You can only punch Out-Time at least 1 hour after In-Time. (Your In-Time was logged at ${existing.inTime}. Out-Time will be available at ${eligibleTimeStr} — ${remainingMin} min remaining).`
              },
              { status: 400 }
            );
          }
        }

        // Valid Out-Time Punch -> Finalize attendance for today
        const updated = await query(
          `UPDATE "Attendance" SET
            "outTime" = $1,
            status = 'Present',
            "updatedAt" = NOW()
          WHERE id = $2
          RETURNING *`,
          [punchTime, existing.id]
        );

        return NextResponse.json({
          success: true,
          punchType: "OUT",
          message: `Out-Time recorded at ${punchTime}. Today's attendance is completed.`,
          data: updated[0]
        });
      }
    }

    // ─── 4. PUNCH 1: First Punch of the Day (In-Time) ───
    const id = `at_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const rows = await query(
      `INSERT INTO "Attendance" (id, "staffId", "staffName", type, date, "inTime", "outTime", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, NOW(), NOW())
       RETURNING *`,
      [id, staffId, staffName, type || "Service Provider", aDate, punchTime, status || "Present"]
    );

    return NextResponse.json({
      success: true,
      punchType: "IN",
      message: `In-Time recorded at ${punchTime}. Next punch (Out-Time) will be available after 1 hour.`,
      data: rows[0]
    });
  } catch (err) {
    console.error("Error logging attendance:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
