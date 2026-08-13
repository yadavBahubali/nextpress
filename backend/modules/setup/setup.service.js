const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const db = require("../../config/db");

class SetupService {
  constructor() {
    this.envPath = path.join(__dirname, "../../.env");
  }

  async getStatus() {
    const envExists = fs.existsSync(this.envPath);
    let dbConnected = false;
    let isInstalled = false;

    if (envExists) {
      try {
        const test = await db.testConnection();
        if (test.ok) {
          dbConnected = true;
          // Check if migrations table exists as a proxy for "installed"
          const tables = await db.queryAll("SHOW TABLES LIKE 'migrations'");
          if (tables.length > 0) {
            isInstalled = true;
          }
        }
      } catch (err) {
        dbConnected = false;
      }
    }

    return {
      envExists,
      dbConnected,
      isInstalled,
    };
  }

  async testConnection(config) {
    try {
      const connection = await mysql.createConnection({
        host: config.db_host,
        user: config.db_user,
        password: config.db_password,
      });
      // Attempt to create the database if it doesn't exist
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db_name}\``);
      await connection.changeUser({ database: config.db_name });
      await connection.ping();
      await connection.end();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  async install(config, adminData, siteData) {
    // 1. Write .env file
    const envContent = `
PORT=8000
NODE_ENV=production
DB_HOST=${config.db_host}
DB_USER=${config.db_user}
DB_PASSWORD=${config.db_password}
DB_NAME=${config.db_name}
JWT_SECRET=${this.generateRandomString(32)}
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=${this.generateRandomString(32)}
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
API_PREFIX=/api/v1
`.trim();

    fs.writeFileSync(this.envPath, envContent);

    // 2. Run Migrations
    // We need a temporary connection because the main 'db' pool might be using old/no credentials
    const connection = await mysql.createConnection({
      host: config.db_host,
      user: config.db_user,
      password: config.db_password,
      multipleStatements: true,
    });

    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db_name}\``);
      await connection.changeUser({ database: config.db_name });
      await connection.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const migrationsDir = path.join(__dirname, "../../database/migrations");
      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"));

      for (const file of files) {
        let sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

        // Remove UTF-8 BOM if present
        sql = sql.replace(/^\uFEFF/, "");

        console.log(`Running migration: ${file}`);

        await connection.query("SET FOREIGN_KEY_CHECKS = 0");

        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

        for (const statement of statements) {
          try {
            console.log("\n--------------------------------");
            console.log(file);
            console.log(statement.substring(0, 200));
            console.log("--------------------------------\n");

            await connection.query(statement);
          } catch (err) {
            console.error("Migration failed:", file);
            console.error(statement.substring(0, 500));
            throw err;
          }
        }

        await connection.query("SET FOREIGN_KEY_CHECKS = 1");

        await connection.query(
          "INSERT INTO migrations (migration_name) VALUES (?)",
          [file],
        );
      }
      // 3. Create Super Admin
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      await connection.query(
        "INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
        [adminData.name, adminData.email, hashedPassword, 1], // role_id 1 is Super Admin
      );

      // 4. Update Site Settings
      if (siteData && siteData.site_title) {
        await connection.query("UPDATE settings SET setting_value = ? WHERE setting_key = 'company_name'", [siteData.site_title]);
      }
      if (siteData && siteData.search_engine_visibility !== undefined) {
        const seoRobotsValue = siteData.search_engine_visibility ? 'index, follow' : 'noindex, nofollow';
        await connection.query("UPDATE settings SET setting_value = ? WHERE setting_key = 'seo_robots'", [seoRobotsValue]);
      }

      return { success: true };
    } catch (err) {
      throw err;
    } finally {
      await connection.end();
    }
  }

  generateRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

module.exports = new SetupService();
