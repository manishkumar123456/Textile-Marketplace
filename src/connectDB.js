import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",        // your postgres username
  host: "localhost",       // or your db host (e.g. Supabase/Neon URL)
  database: "mini-marketplace",        // your database name
  password: "manish0560", // your postgres password
  port: 5432,              // default Postgres port
});

export default pool;
