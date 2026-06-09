import { Pool, types } from "pg";

// Return date columns as strings (YYYY-MM-DD) instead of JS Date objects
// to avoid timezone-induced day shifts in the browser
types.setTypeParser(types.builtins.DATE, (val: string) => val);

let pool: Pool | undefined;

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}
