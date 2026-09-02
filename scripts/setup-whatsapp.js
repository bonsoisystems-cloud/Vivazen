import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    console.log('Connecting to database...');
    // 1. Ensure SoftwareSettings table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "SoftwareSettings" (
        id VARCHAR(50) PRIMARY KEY,
        "remindBirthday" BOOLEAN DEFAULT true,
        "remindAnniversary" BOOLEAN DEFAULT true,
        "remindAppointments" BOOLEAN DEFAULT true,
        "remindPendingPayments" BOOLEAN DEFAULT true,
        "remindPackageExpiry" BOOLEAN DEFAULT true,
        "redeemPointsThreshold" INTEGER DEFAULT 100,
        "pricePerPoint" NUMERIC(10,2) DEFAULT 1.0,
        "maxRedeemPoints" INTEGER DEFAULT 500,
        holidays JSONB DEFAULT '[]',
        "officialWhatsappEnabled" BOOLEAN DEFAULT false,
        "officialWhatsappApiUrl" TEXT,
        "officialWhatsappPhoneId" TEXT,
        "officialWhatsappToken" TEXT,
        "scannerWhatsappEnabled" BOOLEAN DEFAULT true,
        "scannerWhatsappApiUrl" TEXT,
        "scannerWhatsappInstanceId" TEXT,
        "scannerWhatsappToken" TEXT,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const apiUrl = 'https://graph.facebook.com/v20.0/';
    const phoneId = '480661474312900';
    const token = 'EAAG1KLhvAsQBOzAKWlzeH4qYG5ZAx2dCzaChrxnsBZA6ljX5Jgod1i7y0EjjC3pHx6wiZBT53ng3uKhBG6Q1qWpus6MEuRliRqGAB3nGyyFzmbeFs5n0tt3OQpgXpS8ZAXtZChNiBCr8ZCx4tpn6qwyBjfj4FK11vRC6SKNXTEYk0dIqAdPJva3gLv1H1QGSMxhwZDZD';

    const existing = await pool.query('SELECT id FROM "SoftwareSettings" LIMIT 1');
    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE "SoftwareSettings" SET
          "officialWhatsappEnabled" = true,
          "officialWhatsappApiUrl" = $1,
          "officialWhatsappPhoneId" = $2,
          "officialWhatsappToken" = $3,
          "updatedAt" = NOW()
        WHERE id = $4`,
        [apiUrl, phoneId, token, existing.rows[0].id]
      );
      console.log('Updated existing SoftwareSettings with WhatsApp credentials.');
    } else {
      await pool.query(
        `INSERT INTO "SoftwareSettings" (
          id, "officialWhatsappEnabled", "officialWhatsappApiUrl", "officialWhatsappPhoneId", "officialWhatsappToken", "updatedAt"
        ) VALUES (
          'settings_default', true, $1, $2, $3, NOW()
        )`,
        [apiUrl, phoneId, token]
      );
      console.log('Inserted default SoftwareSettings with WhatsApp credentials.');
    }

    const check = await pool.query('SELECT id, "officialWhatsappEnabled", "officialWhatsappPhoneId" FROM "SoftwareSettings" LIMIT 1');
    console.log('Verified row:', check.rows[0]);
  } catch (err) {
    console.error('Error in setup-whatsapp:', err);
  } finally {
    await pool.end();
  }
}

main();
