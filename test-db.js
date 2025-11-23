// test-db.js
import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

async function test() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const r = await pool.query('SELECT 1 as ok');
    console.log('DB connected OK:', r.rows);
  } catch (err) {
    console.error('DB connection failed:', err.message || err);
  } finally {
    await pool.end();
  }
}

test();
