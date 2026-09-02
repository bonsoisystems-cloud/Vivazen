import 'dotenv/config';
import prisma from '../lib/prisma';

async function testUploadRecord() {
  console.log("Testing imageAsset create...");
  const asset = await prisma.imageAsset.create({
    data: {
      name: "Test Upload",
      url: "https://pub-507869809f114df791179bd7ca34415b.r2.dev/test.jpg",
      category: "OTHER",
      alt: "Test Upload Alt",
      detail: "Test Detail",
      order: 99,
    },
  });
  console.log("✅ Created asset:", asset);

  console.log("Cleaning up test asset...");
  await prisma.imageAsset.delete({ where: { id: asset.id } });
  console.log("✅ Cleaned up asset successfully");
}

testUploadRecord()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Upload test failed:", err);
    process.exit(1);
  });
