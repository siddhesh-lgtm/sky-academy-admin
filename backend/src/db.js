import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sky_academy',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  namedPlaceholders: true,
});

export async function query(sql, params) {
  const [rows] = await db.query(sql, params);
  return rows;
}

export async function execute(sql, params) {
  const [result] = await db.execute(sql, params);
  return result;
}
