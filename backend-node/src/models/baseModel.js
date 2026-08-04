const { getPool } = require("../config/database");

class BaseModel {
  static async query(sql, params = []) {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  static async findAll(table, where = {}, orderBy = "id DESC") {
    const conditions = [];
    const values = [];

    Object.entries(where).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      conditions.push(`${key} = ?`);
      values.push(value);
    });

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM ${table} ${whereClause} ORDER BY ${orderBy}`;
    return this.query(sql, values);
  }

  static async create(table, data) {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((column) => data[column]);
    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
    const result = await this.query(sql, values);
    return { id: result.insertId, ...data };
  }
}

module.exports = BaseModel;
