import { db } from "@auth-practices/db";
import { roles } from "@auth-practices/db/schema/index";

async function seed() {
  console.log("🌱 Seeding database...");

  await db
    .insert(roles)
    .values({
      role: "ORG_ADMIN",
    })
    .onConflictDoNothing();

  console.log("✅ Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
