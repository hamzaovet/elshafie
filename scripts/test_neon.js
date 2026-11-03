const { Client } = require('pg');

const poolerUrl = "postgresql://neondb_owner:npg_g8AWivGwJnC4@ep-wild-butterfly-b950p3m7-pooler.c-7.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function test() {
  console.log("Testing connection to Neon DB...");
  const client = new Client({
    connectionString: poolerUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log("Successfully connected to Neon DB via pooler!");
  const res = await client.query("SELECT current_database(), now()");
  console.log("Result:", res.rows[0]);
  await client.end();
}

test().catch(console.error);
