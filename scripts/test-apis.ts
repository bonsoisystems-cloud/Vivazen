import 'dotenv/config';
import prisma from '../lib/prisma';

async function testAll() {
  console.log("Testing hero slides via prisma client...");
  const heroSlides = await prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
  console.log("✅ Hero slides count:", heroSlides.length);
  console.log("Sample hero slide:", heroSlides[0]);
}

testAll()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
