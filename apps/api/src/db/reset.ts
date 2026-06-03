import { config } from "dotenv";
import path from "node:path";

// Load .env.local first, then .env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

console.log("Dropping application tables...");
// Drop in dependency order (states references countries)
await sql`DROP TABLE IF EXISTS states CASCADE`;
await sql`DROP TABLE IF EXISTS countries CASCADE`;

console.log("Dropping drizzle migration journal...");
// Drizzle stores its migration journal in the "drizzle" schema
await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;

console.log("Reset complete — run db:generate then db:migrate then db:seed.");

await sql.end();
