const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const runMigrations = async () => {
  try {
    // 1. Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Get already executed migrations
    const executedMigrations = await db.queryAll('SELECT migration_name FROM migrations');
    const executedMigrationNames = executedMigrations.map(m => m.migration_name);

    // 3. Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

    // 4. Run new migrations
    for (const file of files) {
      if (!executedMigrationNames.includes(file)) {
        console.log(`Running migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        const connection = await db.pool.getConnection();
        try {
          // Enable multiple statements for this connection
          await connection.query('SET FOREIGN_KEY_CHECKS = 0');
          
          // Split by ';' and filter out empty strings to run one by one if multipleStatements is not enabled
          // Or just run the whole thing if we are sure about the SQL.
          // Most migration files will have multiple commands.
          
          const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

          for (const statement of statements) {
            await connection.query(statement);
          }

          await connection.query('SET FOREIGN_KEY_CHECKS = 1');
          
          // 5. Record migration
          await connection.query('INSERT INTO migrations (migration_name) VALUES (?)', [file]);
          console.log(`Successfully completed: ${file}`);
        } catch (err) {
          console.error(`Error in migration ${file}:`, err.message);
          throw err;
        } finally {
          connection.release();
        }
      }
    }

    console.log('All migrations executed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

runMigrations();
