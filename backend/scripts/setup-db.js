const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function assertSafeDbName(dbName) {
  // Prevent SQL injection via CREATE DATABASE identifier.
  // Postgres identifiers are more flexible, but for local dev we keep it simple.
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(
      `Unsafe DB_NAME "${dbName}". Use only letters, numbers, and underscore.`
    );
  }
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(requireEnv('DB_PORT'));
  const user = requireEnv('DB_USER');
  const password = requireEnv('DB_PASSWORD');
  const dbName = requireEnv('DB_NAME');

  assertSafeDbName(dbName);

  // 1) Connect to the admin database (usually 'postgres') to create DB if missing.
  const adminDb = process.env.DB_ADMIN_DB || 'postgres';
  const adminPool = new Pool({ host, port, user, password, database: adminDb });

  try {
    console.log(`[db] Checking connectivity to ${host}:${port} as ${user}...`);
    await adminPool.query('SELECT 1');

    console.log(`[db] Checking if database "${dbName}" exists...`);
    const existsRes = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (existsRes.rows.length === 0) {
      console.log(`[db] Database not found. Creating "${dbName}"...`);
      // Identifiers cannot be parameterized in pg, so we validate and inline.
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log('[db] Database created.');
    } else {
      console.log('[db] Database already exists.');
    }
  } finally {
    await adminPool.end();
  }

  // 2) Apply schema.sql to the target database (safe to run multiple times).
  const targetPool = new Pool({ host, port, user, password, database: dbName });
  try {
    console.log('[db] Applying schema.sql...');
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await targetPool.query(schemaSql);

    console.log('[db] Schema applied successfully.');

    // 3) Quick sanity checks
    const tablesRes = await targetPool.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name`
    );
    console.log('[db] Tables:', tablesRes.rows.map((r) => r.table_name).join(', '));
  } finally {
    await targetPool.end();
  }
}

main().catch((err) => {
  console.error('[db] Setup failed:', err.message);
  process.exit(1);
});
