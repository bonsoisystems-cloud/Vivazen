import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date().toISOString().split("T")[0];

    // Today bills & sales
    const todayBills = await query(
      `SELECT COALESCE(SUM(paid), 0) as "todaySales", COUNT(id) as "todayVisits", COALESCE(SUM(total), 0) as "todayInvoiced" 
       FROM "Bill" WHERE date = $1`,
      [today]
    );

    // Total lifetime sales
    const totalSalesRow = await query(`SELECT COALESCE(SUM(paid), 0) as "totalSales" FROM "Bill"`);

    // Today appointments
    const todayApptsRow = await query(`SELECT COUNT(id) as "todayAppts" FROM "Appointment" WHERE date = $1`, [today]);

    // Today enquiries
    const todayEnquiriesRow = await query(`SELECT COUNT(id) as "todayEnquiries" FROM "Enquiry" WHERE "followDate" = $1`, [today]);

    // Total counts
    const clientsCount = await query(`SELECT COUNT(id) as count FROM "Client"`);
    const staffCount = await query(`SELECT COUNT(id) as count FROM "ServiceProvider"`);
    const productsCount = await query(`SELECT COUNT(id) as count FROM "Product"`);
    const billsCount = await query(`SELECT COUNT(id) as count FROM "Bill"`);
    const dueLeadsCount = await query(`SELECT COUNT(id) as count FROM "Enquiry" WHERE "followDate" <= $1 AND status NOT IN ('Converted', 'Lost')`, [today]);

    // Recent 5 bills
    const recentBills = await query(`SELECT * FROM "Bill" ORDER BY date DESC, "createdAt" DESC LIMIT 5`);

    // Today's appointments list
    const todayAppointments = await query(`SELECT * FROM "Appointment" WHERE date = $1 ORDER BY "time" ASC`, [today]);

    // Recent 5 feedbacks
    const recentFeedbacks = await query(`SELECT * FROM "Feedback" ORDER BY date DESC, "createdAt" DESC LIMIT 5`);

    return NextResponse.json({
      success: true,
      data: {
        todaySales: Number(todayBills[0]?.todaySales || 0),
        todayVisits: Number(todayBills[0]?.todayVisits || 0),
        todayInvoiced: Number(todayBills[0]?.todayInvoiced || 0),
        totalSales: Number(totalSalesRow[0]?.totalSales || 0),
        todayAppointmentsCount: Number(todayApptsRow[0]?.todayAppts || 0),
        todayEnquiriesCount: Number(todayEnquiriesRow[0]?.todayEnquiries || 0),
        totalClients: Number(clientsCount[0]?.count || 0),
        totalStaff: Number(staffCount[0]?.count || 0),
        totalProducts: Number(productsCount[0]?.count || 0),
        totalBills: Number(billsCount[0]?.count || 0),
        dueLeadsCount: Number(dueLeadsCount[0]?.count || 0),
        recentBills,
        todayAppointments,
        recentFeedbacks
      }
    });
  } catch (err) {
    console.error("Error fetching CRM stats:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
