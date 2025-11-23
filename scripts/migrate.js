import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import 'dotenv/config';

const sql = fs.readFileSync(path.join(process.cwd(), 'migrations', '001_create_links.sql'), 'utf8');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query(sql);
    console.log('Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
