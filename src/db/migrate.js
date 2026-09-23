/**
 * Migration Runner
 * - Reads all .sql files from migrations/ in sorted order
 * - Tracks applied migrations in a _migrations meta-table
 * - Idempotent: safe to run multiple times (skips already-applied)
 */

const db = require('./index');
const fs = require('fs');
const path = require('path');

// Ensure the migrations tracking table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name       TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const migrationsDir = path.join(__dirname, 'migrations');
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort(); // Alphabetical order guarantees 001, 002, 003...

console.log(`\n📦 Running migrations from: ${migrationsDir}`);
console.log(`   Found ${migrationFiles.length} migration file(s)\n`);

let applied = 0;

for (const file of migrationFiles) {
  const alreadyApplied = db
    .prepare('SELECT name FROM _migrations WHERE name = ?')
    .get(file);

  if (alreadyApplied) {
    console.log(`  ⏭️  SKIP  ${file} (already applied)`);
    continue;
  }

  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  try {
    db.exec(sql);
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    console.log(`  ✅  OK    ${file}`);
    applied++;
  } catch (err) {
    console.error(`  ❌  FAIL  ${file}`);
    console.error(`           ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n✨ Migrations complete. ${applied} new migration(s) applied.\n`);
process.exit(0);
