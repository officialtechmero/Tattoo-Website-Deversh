import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL!;
const dbSslEnabled = process.env.DB_SSL === "true";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required in environment");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: dbSslEnabled ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool);
