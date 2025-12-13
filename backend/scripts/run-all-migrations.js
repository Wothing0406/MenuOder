/**
 * Unified migration runner for MySQL/PostgreSQL.
 * - Autodetects DB dialect from env (DB_TYPE or DATABASE_URL)
 * - Applies all SQL migrations in /database in a fixed order
 * - Optional seeding when RUN_SEED=true or --seed flag
 *
 * Usage:
 *   node scripts/run-all-migrations.js [--seed]
 *
 * Env:
 *   DB_TYPE=mysql|postgres (optional, inferred from DATABASE_URL if absent)
 *   DATABASE_URL=postgres://... (for Postgres)
 *   DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD (for MySQL)
 *   RUN_SEED=true (optional)
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mysql = require('mysql2/promise');
const { Client: PgClient } = require('pg');

const ROOT = path.join(__dirname, '..', '..');
const DB_DIR = path.join(ROOT, 'database');

const args = process.argv.slice(2);
const shouldSeed = process.env.RUN_SEED === 'true' || args.includes('--seed');

// Detect dialect
function detectDialect() {
  const url = process.env.DATABASE_URL || '';
  const type = (process.env.DB_TYPE || '').toLowerCase();
  if (type === 'postgres' || url.startsWith('postgres')) return 'postgres';
  return 'mysql';
}

const DIALECT = detectDialect();

// Ordered migrations by dialect
const MIGRATIONS_MYSQL = [
  'migration_add_new_features.sql',
  'migration_fix_customer_fields.sql',
  'migration_add_detailed_address.sql',
  'migration_add_vouchers.sql',
  'migration_fix_voucher_storeId_nullable.sql',
  'migration_add_completed_status.sql',
  'migration_add_storeGoogleMapLink.sql',
  'migration_fix_item_deletion.sql',
  'migration_add_reviews.sql',
  'migration_add_zalopay.sql',
  'migration_add_bank_transfer.sql',
  'migration_add_bank_transfer_qr_code_to_orders.sql',
  'migration_add_payment_accounts.sql',
  'migration_add_payment_account_to_orders.sql',
  'migration_verify_payment_accounts.sql' // Verify and add missing columns
];

const MIGRATIONS_POSTGRES = [
  'migration_add_new_features_postgresql.sql',
  'migration_add_completed_status_postgresql.sql',
  'migration_fix_item_deletion_postgresql.sql',
  'migration_add_reviews_postgresql.sql',
  'migration_add_payment_accounts_postgresql.sql',
  'migration_add_payment_account_to_orders_postgresql.sql',
  'migration_verify_payment_accounts_postgresql.sql' // Verify and add missing columns
];

const SEED_FILE = 'seed.sql';

function fileExists(file) {
  return fs.existsSync(path.join(DB_DIR, file));
}

async function runMySQL() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'menu_order_db',
    multipleStatements: true
  });

  try {
    console.log('🔌 Connected to MySQL');
    const files = MIGRATIONS_MYSQL.filter(fileExists);
    for (const file of files) {
      const sqlPath = path.join(DB_DIR, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`🛠  Applying ${file} ...`);
      try {
        await connection.query(sql);
        console.log(`✅ Done ${file}`);
      } catch (err) {
        // Ignore duplicate/exists errors to keep idempotent
        const msg = err.message || '';
        if (
          msg.includes('Duplicate column') ||
          msg.includes('ER_DUP_FIELDNAME') ||
          msg.includes('already exists') ||
          msg.includes('Duplicate key') ||
          msg.includes('Cannot add column') // for enum duplicates etc.
        ) {
          console.log(`ℹ️  Skipped (already applied): ${file} -> ${msg}`);
        } else {
          throw err;
        }
      }
    }

    if (shouldSeed && fileExists(SEED_FILE)) {
      const seedSql = fs.readFileSync(path.join(DB_DIR, SEED_FILE), 'utf8');
      console.log('🌱 Seeding data ...');
      await connection.query(seedSql);
      console.log('✅ Seed completed');
    }
  } finally {
    await connection.end();
  }
}

async function runPostgres() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for Postgres');
  }

  const client = new PgClient({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const execSql = async (sql) => {
    // Simple splitter by semicolon; suitable for current migration files
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await client.query(stmt);
    }
  };

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL');

    const files = MIGRATIONS_POSTGRES.filter(fileExists);
    for (const file of files) {
      const sqlPath = path.join(DB_DIR, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`🛠  Applying ${file} ...`);
      try {
        await execSql(sql);
        console.log(`✅ Done ${file}`);
      } catch (err) {
        const msg = err.message || '';
        if (
          msg.includes('already exists') ||
          msg.includes('duplicate column') ||
          msg.includes('Duplicate column') ||
          msg.includes('duplicate key value')
        ) {
          console.log(`ℹ️  Skipped (already applied): ${file} -> ${msg}`);
        } else {
          throw err;
        }
      }
    }

    if (shouldSeed && fileExists(SEED_FILE)) {
      const seedSql = fs.readFileSync(path.join(DB_DIR, SEED_FILE), 'utf8');
      console.log('🌱 Seeding data ...');
      await execSql(seedSql);
      console.log('✅ Seed completed');
    }
  } finally {
    await client.end();
  }
}

async function main() {
  console.log(`🚀 Running unified migrations (${DIALECT})`);
  if (DIALECT === 'postgres') {
    await runPostgres();
  } else {
    await runMySQL();
  }
  console.log('✨ All migrations finished');
}

main().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});


