const mysql = require("mysql2/promise");
require("dotenv").config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "delta_aiciitd",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    console.log("✅ MySQL2 pool created");
  }
  // `where` may contain `?` placeholders; pass the values to bind for them in
  // `whereParams`. Existing callers that inline raw values into `where`
  // continue to work (whereParams simply stays empty), but new/updated
  // callers should always prefer `?` + whereParams to avoid SQL injection.
  async select(tbl_name, column = "*", where = "", whereParams = [], print = false) {
    const wr = where ? ` WHERE ${where}` : "";
    const sql = `SELECT ${column} FROM ${tbl_name}${wr}`;
    if (print) console.log(sql, whereParams);
    const [rows] = await this.pool.query(sql, whereParams);
    return rows[0];
  }
  async selectAll(
    tbl_name,
    column = "*",
    where = "",
    orderby = "",
    whereParams = [],
    print = false,
  ) {
    const wr = where ? ` WHERE ${where}` : "";
    const sql = `SELECT ${column} FROM ${tbl_name}${wr} ${orderby}`;
    if (print) console.log(sql, whereParams);
    const [rows] = await this.pool.query(sql, whereParams);
    return rows;
  }
  async insert(tbl_name, data, print = false) {
    const fields = Object.keys(data)
      .map((k) => `\`${k}\``)
      .join(",");
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(",");
    const values = Object.values(data);
    const sql = `INSERT INTO ${tbl_name} (${fields}) VALUES (${placeholders})`;
    if (print) console.log(sql);
    const [result] = await this.pool.execute(sql, values);
    return {
      status: true,
      insertId: result.insertId,
      insert_id: result.insertId,
      affected_rows: result.affectedRows,
    };
  }
  async update(table_name, form_data, where = "", whereParams = [], print = false) {
    const sets = Object.keys(form_data)
      .map((k) => `\`${k}\` = ?`)
      .join(", ");
    const values = [...Object.values(form_data), ...whereParams];
    const whereSQL = where ? ` WHERE ${where}` : "";
    const sql = `UPDATE ${table_name} SET ${sets}${whereSQL}`;
    if (print) console.log(sql, values);
    const [result] = await this.pool.execute(sql, values);
    return { status: true, affected_rows: result.affectedRows };
  }
  async delete(tbl_name, where = "", whereParams = [], print = false) {
    const whereSQL = where ? ` WHERE ${where}` : "";
    const sql = `DELETE FROM ${tbl_name}${whereSQL}`;
    if (print) console.log(sql, whereParams);
    const [result] = await this.pool.query(sql, whereParams);
    return { status: true };
  }
  async query(sql, print = false) {
    if (print) console.log(sql);
    const [rows] = await this.pool.query(sql);
    return rows[0];
  }
  async queryAll(sql, print = false) {
    if (print) console.log(sql);
    const [rows] = await this.pool.query(sql);
    return rows;
  }
  async query_All(sql, params = [], print = false) {
    if (print) console.log(sql, params);
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }
  async insertAll(sql, print = false) {
    if (print) console.log(sql);
    await this.pool.query(sql);
    return { status: true };
  }
  async testConnection() {
    try {
      await this.pool.query("SELECT 1");
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err.message, code: err.code };
    }
  }
  async close() {
    await this.pool.end();
    console.log("Database pool closed.");
  }
}
module.exports = new Database();
