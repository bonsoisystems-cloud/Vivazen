import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_faNq7KCAWDT4@ep-polished-dream-aie4dppz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

export const pool = globalForPg.pgPool ?? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
});

pool.on('error', (err) => {
  console.warn('Postgres connection pool idle client notice:', err.message);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const maxRetries = 3;
  let attempt = 0;

  while (true) {
    let client;
    try {
      client = await pool.connect();
      const res = await client.query(text, params);
      return res.rows as T[];
    } catch (err: any) {
      attempt++;
      const isTransient =
        err.code === 'ENOTFOUND' ||
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        err.code === '57P01' ||
        err.message?.includes('timeout') ||
        err.message?.includes('Connection terminated');

      if (isTransient && attempt < maxRetries) {
        console.warn(`[DB Retry ${attempt}/${maxRetries}] Retrying database query due to: ${err.code || err.message}`);
        await new Promise(res => setTimeout(res, attempt * 400));
        continue;
      }
      throw err;
    } finally {
      if (client) client.release();
    }
  }
}

export async function initCrmTables() {
  const columnMigrations = [
    `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF'; EXCEPTION WHEN OTHERS THEN NULL; END; END IF; END $$;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT '{}'`,
    `ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "duration" INTEGER DEFAULT 30`,
    `ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "membershipPrice" DOUBLE PRECISION`,
    `ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "rewardPoints" INTEGER DEFAULT 0`,
    `ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "serviceFor" TEXT DEFAULT 'Female'`,
    `ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "hideOnWebsite" BOOLEAN DEFAULT false`,
    `ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "desc" TEXT`,
    `ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0`,
    `ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "icon" TEXT`,
    `ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "desc" TEXT`,
    `ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "gradient" TEXT`,
    `ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0`,
    `ALTER TABLE "SubCategory" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Service Provider'`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "department" TEXT DEFAULT 'Salon & Spa'`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'Beautician'`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "specialization" TEXT DEFAULT 'Hair & Beauty'`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER DEFAULT 1`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "commissionService" DOUBLE PRECISION DEFAULT 15`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "commissionProduct" DOUBLE PRECISION DEFAULT 10`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "salary" DOUBLE PRECISION DEFAULT 12000`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "hoursStart" TEXT DEFAULT '10:00'`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "hoursEnd" TEXT DEFAULT '19:00'`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "gender" TEXT DEFAULT 'Female'`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "dob" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "joiningDate" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "address" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "emergency" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "panNumber" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "panDoc" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "aadharNumber" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "aadharDoc" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "photo" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "bankName" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "bankAccount" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "ifscCode" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "upiId" TEXT`,
    `ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "attendanceId" TEXT`,
  ];

  for (const sql of columnMigrations) {
    try {
      await query(sql);
    } catch {
      // Ignore if table does not exist yet
    }
  }

  try {
    await query(`
      -- Branches
      CREATE TABLE IF NOT EXISTS "Branch" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "gst" TEXT,
        "hours" TEXT DEFAULT '10:00-20:00',
        "status" TEXT DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Clients
      CREATE TABLE IF NOT EXISTS "Client" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "phone" TEXT UNIQUE NOT NULL,
        "email" TEXT,
        "gender" TEXT DEFAULT 'Female',
        "dob" TEXT,
        "anniversary" TEXT,
        "address" TEXT DEFAULT 'Jaunpur',
        "source" TEXT DEFAULT 'Walk-in',
        "inviteCode" TEXT UNIQUE NOT NULL,
        "points" INTEGER DEFAULT 0,
        "walletBalance" DOUBLE PRECISION DEFAULT 0,
        "membershipId" TEXT,
        "firstVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Service Providers (Beauticians/Stylists)
      CREATE TABLE IF NOT EXISTS "ServiceProvider" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "emergency" TEXT,
        "emergencyPhone" TEXT,
        "type" TEXT DEFAULT 'Beautician',
        "commissionService" DOUBLE PRECISION DEFAULT 15,
        "commissionProduct" DOUBLE PRECISION DEFAULT 10,
        "salary" DOUBLE PRECISION DEFAULT 12000,
        "hoursStart" TEXT DEFAULT '10:00',
        "hoursEnd" TEXT DEFAULT '19:00',
        "gender" TEXT DEFAULT 'Female',
        "dob" TEXT,
        "joiningDate" TEXT,
        "attendanceId" TEXT UNIQUE NOT NULL,
        "photo" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Administrative Employees
      CREATE TABLE IF NOT EXISTS "Employee" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "role" TEXT DEFAULT 'Receptionist',
        "department" TEXT DEFAULT 'Front Desk',
        "salary" DOUBLE PRECISION DEFAULT 15000,
        "hoursStart" TEXT DEFAULT '09:30',
        "hoursEnd" TEXT DEFAULT '19:30',
        "gender" TEXT DEFAULT 'Female',
        "dob" TEXT,
        "joiningDate" TEXT,
        "attendanceId" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments
      CREATE TABLE IF NOT EXISTS "Appointment" (
        "id" TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "time" TEXT NOT NULL,
        "services" JSONB NOT NULL DEFAULT '[]',
        "total" DOUBLE PRECISION DEFAULT 0,
        "advance" DOUBLE PRECISION DEFAULT 0,
        "status" TEXT DEFAULT 'Pending',
        "source" TEXT DEFAULT 'Software',
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Bills / Invoices
      CREATE TABLE IF NOT EXISTS "Bill" (
        "id" TEXT PRIMARY KEY,
        "billNo" TEXT UNIQUE NOT NULL,
        "clientId" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "items" JSONB NOT NULL DEFAULT '[]',
        "subtotal" DOUBLE PRECISION DEFAULT 0,
        "discount" DOUBLE PRECISION DEFAULT 0,
        "taxRate" DOUBLE PRECISION DEFAULT 0,
        "taxAmount" DOUBLE PRECISION DEFAULT 0,
        "advanceAdjust" DOUBLE PRECISION DEFAULT 0,
        "walletDeduct" DOUBLE PRECISION DEFAULT 0,
        "total" DOUBLE PRECISION DEFAULT 0,
        "paid" DOUBLE PRECISION DEFAULT 0,
        "pending" DOUBLE PRECISION DEFAULT 0,
        "payments" JSONB NOT NULL DEFAULT '[]',
        "status" TEXT DEFAULT 'Settled',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Enquiries & Leads
      CREATE TABLE IF NOT EXISTS "Enquiry" (
        "id" TEXT PRIMARY KEY,
        "clientName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "address" TEXT,
        "enquiryFor" TEXT NOT NULL,
        "enquiryType" TEXT DEFAULT 'General Inquiry',
        "response" TEXT,
        "followDate" TEXT NOT NULL,
        "source" TEXT DEFAULT 'Walk-in',
        "representative" TEXT,
        "status" TEXT DEFAULT 'Warm',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Feedbacks
      CREATE TABLE IF NOT EXISTS "Feedback" (
        "id" TEXT PRIMARY KEY,
        "billNo" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "email" TEXT,
        "overall" INTEGER DEFAULT 5,
        "timely" INTEGER DEFAULT 5,
        "support" INTEGER DEFAULT 5,
        "satisfaction" INTEGER DEFAULT 5,
        "serviceRating" INTEGER DEFAULT 5,
        "review" TEXT,
        "suggestion" TEXT,
        "date" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Google Business Profile Reviews
      CREATE TABLE IF NOT EXISTS "GoogleReview" (
        "id" TEXT PRIMARY KEY,
        "authorName" TEXT NOT NULL,
        "authorPhoto" TEXT,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "text" TEXT NOT NULL,
        "relativeTime" TEXT DEFAULT 'Recently',
        "replyText" TEXT,
        "repliedAt" TIMESTAMP(3),
        "repliedBy" TEXT,
        "isPublishedOnWeb" BOOLEAN DEFAULT true,
        "source" TEXT DEFAULT 'Google Business Profile',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Products & Inventory
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "mrp" DOUBLE PRECISION NOT NULL,
        "salePrice" DOUBLE PRECISION NOT NULL,
        "volume" TEXT DEFAULT '100',
        "unit" TEXT DEFAULT 'ML',
        "barcode" TEXT UNIQUE NOT NULL,
        "rewardPoints" INTEGER DEFAULT 0,
        "stock" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- In-Salon Product Usages
      CREATE TABLE IF NOT EXISTS "ProductUsage" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "productName" TEXT NOT NULL,
        "qty" INTEGER DEFAULT 1,
        "providerId" TEXT NOT NULL,
        "providerName" TEXT NOT NULL,
        "assignedBy" TEXT DEFAULT 'Super Admin',
        "date" TEXT NOT NULL,
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Vendors
      CREATE TABLE IF NOT EXISTS "Vendor" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "gst" TEXT,
        "address" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Stock Purchases
      CREATE TABLE IF NOT EXISTS "StockPurchase" (
        "id" TEXT PRIMARY KEY,
        "vendorId" TEXT NOT NULL,
        "vendorName" TEXT NOT NULL,
        "invoiceNo" TEXT,
        "date" TEXT NOT NULL,
        "items" JSONB NOT NULL DEFAULT '[]',
        "total" DOUBLE PRECISION DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Expenses
      CREATE TABLE IF NOT EXISTS "Expense" (
        "id" TEXT PRIMARY KEY,
        "date" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "paymentMode" TEXT DEFAULT 'Cash',
        "recipient" TEXT NOT NULL,
        "paidBy" TEXT DEFAULT 'Super Admin',
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Loyalty Memberships
      CREATE TABLE IF NOT EXISTS "Membership" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "durationDays" INTEGER DEFAULT 365,
        "rewardOnPurchase" INTEGER DEFAULT 0,
        "discountServices" DOUBLE PRECISION DEFAULT 10,
        "discountServicesType" TEXT DEFAULT '%',
        "discountProducts" DOUBLE PRECISION DEFAULT 10,
        "discountProductsType" TEXT DEFAULT '%',
        "discountPackages" DOUBLE PRECISION DEFAULT 10,
        "discountPackagesType" TEXT DEFAULT '%',
        "pointsBoost" TEXT DEFAULT '1X',
        "minPoints" INTEGER DEFAULT 0,
        "minBill" DOUBLE PRECISION DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Promotional Coupons
      CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "discount" DOUBLE PRECISION NOT NULL,
        "discountType" TEXT DEFAULT '%',
        "minBill" DOUBLE PRECISION DEFAULT 0,
        "maxDiscount" DOUBLE PRECISION DEFAULT 0,
        "perUser" INTEGER DEFAULT 1,
        "validTill" TEXT NOT NULL,
        "rewardPoints" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Service Reminders
      CREATE TABLE IF NOT EXISTS "ServiceReminder" (
        "id" TEXT PRIMARY KEY,
        "serviceId" TEXT NOT NULL,
        "serviceName" TEXT NOT NULL,
        "afterDays" INTEGER DEFAULT 30,
        "template" TEXT NOT NULL,
        "channel" TEXT DEFAULT 'WhatsApp',
        "status" TEXT DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Daily Self Assessments
      CREATE TABLE IF NOT EXISTS "SelfAssessment" (
        "id" TEXT PRIMARY KEY,
        "date" TEXT NOT NULL,
        "branchId" TEXT DEFAULT 'b1',
        "branchName" TEXT DEFAULT 'Jaunpur',
        "cleanliness" INTEGER DEFAULT 5,
        "reception" INTEGER DEFAULT 5,
        "service" INTEGER DEFAULT 5,
        "punctuality" INTEGER DEFAULT 5,
        "display" INTEGER DEFAULT 5,
        "feedback" INTEGER DEFAULT 5,
        "targetMet" BOOLEAN DEFAULT true,
        "targetAmount" DOUBLE PRECISION DEFAULT 0,
        "actualAmount" DOUBLE PRECISION DEFAULT 0,
        "notes" TEXT,
        "submittedBy" TEXT DEFAULT 'Super Admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- SMS & Broadcast Logs
      CREATE TABLE IF NOT EXISTS "SmsLog" (
        "id" TEXT PRIMARY KEY,
        "date" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "channel" TEXT DEFAULT 'WhatsApp',
        "message" TEXT NOT NULL,
        "status" TEXT DEFAULT 'Sent',
        "sentBy" TEXT DEFAULT 'Super Admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Inter-Branch Transfers
      CREATE TABLE IF NOT EXISTS "InterBranchTransfer" (
        "id" TEXT PRIMARY KEY,
        "date" TEXT NOT NULL,
        "type" TEXT DEFAULT 'Stock',
        "fromBranch" TEXT NOT NULL,
        "toBranch" TEXT NOT NULL,
        "details" JSONB NOT NULL DEFAULT '{}',
        "status" TEXT DEFAULT 'Completed',
        "by" TEXT DEFAULT 'Super Admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Staff Daily Attendance
      CREATE TABLE IF NOT EXISTS "Attendance" (
        "id" TEXT PRIMARY KEY,
        "staffId" TEXT NOT NULL,
        "staffName" TEXT NOT NULL,
        "type" TEXT DEFAULT 'Service Provider',
        "date" TEXT NOT NULL,
        "inTime" TEXT,
        "outTime" TEXT,
        "status" TEXT DEFAULT 'Present',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ CRM Database tables verified / initialized successfully.");
  } catch (err) {
    console.error("⚠️ Failed to initialize CRM tables:", err);
  }
}
