import { config } from "dotenv";
import path from "node:path";

// Load .env.local first, then .env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { countries, states } from "./schema/index.js";

// ─── Seed Data ───────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
] as const;

const STATES: Record<string, { code: string; name: string }[]> = {
  US: [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ],
  CA: [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "British Columbia" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "YT", name: "Yukon" },
  ],
  AU: [
    { code: "NSW", name: "New South Wales" },
    { code: "VIC", name: "Victoria" },
    { code: "QLD", name: "Queensland" },
    { code: "WA", name: "Western Australia" },
    { code: "SA", name: "South Australia" },
    { code: "TAS", name: "Tasmania" },
    { code: "ACT", name: "Australian Capital Territory" },
    { code: "NT", name: "Northern Territory" },
  ],
};

// ─── Main ────────────────────────────────────────────────────────────

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const queryClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(queryClient);

  console.log("🌱 Starting seed...\n");

  // Clear existing data (states first due to FK constraint)
  console.log("  Clearing existing data...");
  await db.delete(states);
  await db.delete(countries);

  // Insert countries
  console.log("  Inserting countries...");
  const insertedCountries = await db
    .insert(countries)
    .values(
      COUNTRIES.map((c) => ({
        code: c.code,
        name: c.name,
        isActive: true,
      }))
    )
    .returning();

  console.log(`  ✅ Inserted ${insertedCountries.length} countries`);

  // Build a lookup: code → id
  const countryIdMap = new Map<string, number>();
  for (const c of insertedCountries) {
    countryIdMap.set(c.code, c.id);
  }

  // Insert states for each country
  let totalStates = 0;
  for (const [countryCode, stateList] of Object.entries(STATES)) {
    const countryId = countryIdMap.get(countryCode);
    if (!countryId) {
      console.warn(`  ⚠ Country ${countryCode} not found, skipping states`);
      continue;
    }

    const insertedStates = await db
      .insert(states)
      .values(
        stateList.map((s) => ({
          code: s.code,
          name: s.name,
          isActive: true,
          countryId,
        }))
      )
      .returning();

    totalStates += insertedStates.length;
    console.log(
      `  ✅ Inserted ${insertedStates.length} states for ${countryCode}`
    );
  }

  console.log(`\n🎉 Seed complete! ${insertedCountries.length} countries, ${totalStates} states.`);

  await queryClient.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
