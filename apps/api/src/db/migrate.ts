import { config } from "dotenv";
import path from "node:path";

// Load .env.local first, then .env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

console.log("Running migrations...");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations applied successfully.");

await sql.end();
