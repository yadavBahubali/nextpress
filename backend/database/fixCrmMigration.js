const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const runSpecificMigration = async () => {
  try {
    const filePath = path.join(__dirname, 'migrations', '025_crm_enhancements.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('Running migration 025 manually...');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const connection = await db.pool.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const statement of statements) {
        await connection.query(statement);
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      
      try {
        await connection.query('INSERT IGNORE INTO migrations (migration_name) VALUES (?)', ['025_crm_enhancements.sql']);
      } catch (e) {
        // Table might not exist yet, ignore
      }
      
      console.log('Migration 025 completed successfully.');
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
};

runSpecificMigration();
