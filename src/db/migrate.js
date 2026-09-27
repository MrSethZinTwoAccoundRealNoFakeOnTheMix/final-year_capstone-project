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
    if (err.message && err.message.includes('duplicate column name')) {
      // Column was already added manually or during prior testing.
      // Execute each statement individually so the rest of the migration (indexes, data backfills) runs.
      try {
        const statements = sql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        for (const stmt of statements) {
          try {
            db.exec(stmt);
          } catch (innerErr) {
            if (!innerErr.message || !innerErr.message.includes('duplicate column name')) {
              throw innerErr;
            }
          }
        }
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
        console.log(`  ✅  OK    ${file} (reconciled: column already existed)`);
        applied++;
        continue;
      } catch (recoveryErr) {
        console.error(`  ❌  FAIL  ${file}`);
        console.error(`           ${recoveryErr.message}`);
        process.exit(1);
      }
    }
    console.error(`  ❌  FAIL  ${file}`);
    console.error(`           ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n✨ Migrations complete. ${applied} new migration(s) applied.\n`);
process.exit(0);
