import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Try to find by ID first, then by billNo
    let bills = await query(`SELECT * FROM "Bill" WHERE id = $1`, [id]);
    if (bills.length === 0) {
      bills = await query(`SELECT * FROM "Bill" WHERE "billNo" = $1`, [id]);
    }

    if (bills.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const bill = bills[0];

    // Fetch client details
    let client = null;
    if (bill.clientId) {
      const clientRows = await query(`SELECT * FROM "Client" WHERE id = $1`, [bill.clientId]);
      if (clientRows.length > 0) client = clientRows[0];
    }

    // Parse items JSON if stored as string
    let items = bill.items;
    if (typeof items === "string") {
      try { items = JSON.parse(items); } catch { items = []; }
    }

    let payments = bill.payments;
    if (typeof payments === "string") {
      try { payments = JSON.parse(payments); } catch { payments = []; }
    }

    const previousDues = bill.previousDues != null
      ? Number(bill.previousDues)
      : Array.isArray(payments) && payments[0]?.previousDues != null
      ? Number(payments[0].previousDues)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...bill,
        items,
        payments,
        previousDues,
        client
      }
    });
  } catch (err) {
    console.error("Error fetching invoice:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      clientName, phone, date, items, subtotal, discount,
      taxRate, taxAmount, advanceAdjust, walletDeduct, total, paid, pending, payments, status
    } = body;

    // Check if bill exists
    let existing = await query(`SELECT id FROM "Bill" WHERE id = $1`, [id]);
    if (existing.length === 0) {
      existing = await query(`SELECT id FROM "Bill" WHERE "billNo" = $1`, [id]);
    }

    const targetId = existing[0].id;
    const todayStr = new Date().toISOString().split("T")[0];

    if (date && date > todayStr) {
      return NextResponse.json(
        { error: "Cannot set invoice date to a future date. Future bookings must be scheduled as Appointments." },
        { status: 400 }
      );
    }

    const paymentsWithMeta = payments !== undefined
      ? (Array.isArray(payments) && payments.length > 0
          ? payments.map((p: any, idx: number) => (idx === 0 ? { ...p, previousDues: Number(body.previousDues || 0) } : p))
          : [{ mode: "Cash", amount: Number(paid || 0), previousDues: Number(body.previousDues || 0) }])
      : (body.previousDues !== undefined ? [{ mode: "Cash", amount: Number(paid || 0), previousDues: Number(body.previousDues || 0) }] : null);

    const rows = await query(
      `UPDATE "Bill" SET
        "clientName" = COALESCE($1, "clientName"),
        phone = COALESCE($2, phone),
        date = COALESCE($3, date),
        items = COALESCE($4, items),
        subtotal = COALESCE($5, subtotal),
        discount = COALESCE($6, discount),
        "taxRate" = COALESCE($7, "taxRate"),
        "taxAmount" = COALESCE($8, "taxAmount"),
        "advanceAdjust" = COALESCE($9, "advanceAdjust"),
        "walletDeduct" = COALESCE($10, "walletDeduct"),
        total = COALESCE($11, total),
        paid = COALESCE($12, paid),
        pending = COALESCE($13, pending),
        payments = COALESCE($14, payments),
        status = COALESCE($15, status),
        "updatedAt" = NOW()
      WHERE id = $16
      RETURNING *`,
      [
        clientName,
        phone,
        date,
        items !== undefined ? JSON.stringify(items) : null,
        subtotal !== undefined ? Number(subtotal) : null,
        discount !== undefined ? Number(discount) : null,
        taxRate !== undefined ? Number(taxRate) : null,
        taxAmount !== undefined ? Number(taxAmount) : null,
        advanceAdjust !== undefined ? Number(advanceAdjust) : null,
        walletDeduct !== undefined ? Number(walletDeduct) : null,
        total !== undefined ? Number(total) : null,
        paid !== undefined ? Number(paid) : null,
        pending !== undefined ? Number(pending) : null,
        paymentsWithMeta !== null ? JSON.stringify(paymentsWithMeta) : null,
        status,
        targetId
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error updating bill:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Delete by id or billNo
    await query(`DELETE FROM "Bill" WHERE id = $1 OR "billNo" = $1`, [id]);

    return NextResponse.json({ success: true, message: "Bill deleted successfully" });
  } catch (err) {
    console.error("Error deleting bill:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
