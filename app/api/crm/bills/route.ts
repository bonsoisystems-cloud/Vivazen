import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const billNo = searchParams.get("billNo");

    if (clientId) {
      const rows = await query(`SELECT * FROM "Bill" WHERE "clientId" = $1 ORDER BY "date" DESC, "createdAt" DESC`, [clientId]);
      return NextResponse.json({ success: true, data: rows });
    }

    if (billNo) {
      const rows = await query(`SELECT * FROM "Bill" WHERE "billNo" = $1`, [billNo]);
      return NextResponse.json({ success: true, data: rows[0] || null });
    }

    const rows = await query(`SELECT * FROM "Bill" ORDER BY "date" DESC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching bills:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      billNo, clientId, clientName, phone, email, date, items, subtotal, discount,
      taxRate, taxAmount, advanceAdjust, walletDeduct, total, paid, pending, payments, status
    } = body;

    if (!billNo || !clientName || !phone) {
      return NextResponse.json({ error: "Bill number, client name, and phone are required" }, { status: 400 });
    }

    const id = `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const billDate = date || new Date().toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];

    // BLOCK FUTURE BILLING: Only appointments can be scheduled in the future
    if (billDate > todayStr) {
      return NextResponse.json(
        { error: "Future billing is blocked. You cannot generate a bill for a future date. Future bookings must be scheduled as Appointments." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanName = clientName.trim();
    const cleanEmail = email ? email.trim() : null;

    // Ensure client exists or create automatically
    let cid = clientId;
    const existing = await query(`SELECT * FROM "Client" WHERE phone = $1`, [cleanPhone]);

    if (existing.length > 0) {
      cid = existing[0].id;
      // If email is provided or name updated, update client profile
      await query(
        `UPDATE "Client" SET
          name = COALESCE(NULLIF($1, ''), name),
          email = COALESCE($2, email),
          "lastVisit" = NOW(),
          "updatedAt" = NOW()
         WHERE id = $3`,
        [cleanName, cleanEmail, cid]
      );
    } else {
      cid = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const inviteCode = `VIV${Math.floor(1000 + Math.random() * 9000)}`;
      await query(
        `INSERT INTO "Client" (
          id, name, phone, email, "gender", "address", "source", "inviteCode", "points", "walletBalance", "firstVisit", "lastVisit", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, 'Female', 'Jaunpur', 'Walk-in (POS Direct)', $5, 0, 0, NOW(), NOW(), NOW(), NOW()
        )`,
        [cid, cleanName, cleanPhone, cleanEmail, inviteCode]
      );
    }

    const paymentsWithMeta = Array.isArray(payments) && payments.length > 0
      ? payments.map((p: any, idx: number) => (idx === 0 ? { ...p, previousDues: Number(body.previousDues || 0) } : p))
      : [{ mode: "Cash", amount: Number(paid || 0), previousDues: Number(body.previousDues || 0) }];

    // Insert bill
    const rows = await query(
      `INSERT INTO "Bill" (
        id, "billNo", "clientId", "clientName", phone, date, items, subtotal, discount,
        "taxRate", "taxAmount", "advanceAdjust", "walletDeduct", total, paid, pending, payments, status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      RETURNING *`,
      [
        id, billNo, cid, clientName, phone, billDate,
        JSON.stringify(items || []),
        Number(subtotal || 0),
        Number(discount || 0),
        Number(taxRate || 0),
        Number(taxAmount || 0),
        Number(advanceAdjust || 0),
        Number(walletDeduct || 0),
        Number(total || 0),
        Number(paid || 0),
        Number(pending || 0),
        JSON.stringify(paymentsWithMeta),
        status || "Settled"
      ]
    );

    // If previous dues were added & paid on this bill, settle the corresponding past bills
    if (Number(body.previousDues || 0) > 0 && Number(paid || 0) > 0) {
      const duesToSettle = Number(body.previousDues || 0);
      const pastPendingBills = await query(
        `SELECT id, pending, paid FROM "Bill" 
         WHERE (phone = $1 OR "clientId" = $2) AND pending > 0 AND id != $3
         ORDER BY date ASC, "createdAt" ASC`,
        [cleanPhone, cid, id]
      );

      let remainingSettlement = duesToSettle;
      for (const pb of pastPendingBills) {
        if (remainingSettlement <= 0) break;
        const pbPending = Number(pb.pending || 0);
        const pbPaid = Number(pb.paid || 0);
        const deduction = Math.min(pbPending, remainingSettlement);
        const newPending = pbPending - deduction;
        const newPaid = pbPaid + deduction;
        await query(
          `UPDATE "Bill" SET 
             paid = $1, 
             pending = $2, 
             status = $3, 
             "updatedAt" = NOW() 
           WHERE id = $4`,
          [newPaid, newPending, newPending === 0 ? "Settled" : "Pending Dues", pb.id]
        );
        remainingSettlement -= deduction;
      }
    }

    // Update client reward points & wallet
    const earnedPoints = Math.floor(Number(paid || 0) / 50);
    await query(
      `UPDATE "Client" SET
        points = points + $1,
        "walletBalance" = GREATEST(0, "walletBalance" - $2),
        "lastVisit" = NOW(),
        "updatedAt" = NOW()
       WHERE id = $3`,
      [earnedPoints, Number(walletDeduct || 0), cid]
    );

    // If advance payment was deducted, mark corresponding appointment as 'Billed' so advance is consumed
    if (Number(advanceAdjust || 0) > 0 || body.appointmentId) {
      if (body.appointmentId) {
        await query(
          `UPDATE "Appointment" SET status = 'Billed', "updatedAt" = NOW() WHERE id = $1`,
          [body.appointmentId]
        );
      } else {
        await query(
          `UPDATE "Appointment" SET status = 'Billed', "updatedAt" = NOW() 
           WHERE id IN (
             SELECT id FROM "Appointment" 
             WHERE (phone = $1 OR "clientId" = $2) AND status != 'Billed' AND status != 'Cancelled' AND advance > 0
             ORDER BY date ASC, time ASC
             LIMIT 1
           )`,
          [phone, cid]
        );
      }
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating bill:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
