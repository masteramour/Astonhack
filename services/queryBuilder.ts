/**
 * Query Builder - Utility module for common database operations
 * Centralizes query patterns to reduce code duplication
 */

import type { Connection } from 'mysql2/promise';

/**
 * Generic count query
 */
export async function count(db: Connection, table: string, whereClause?: string): Promise<number> {
  const query = whereClause 
    ? `SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}` 
    : `SELECT COUNT(*) as count FROM ${table}`;
  const [rows] = await db.execute(query);
  return (rows as any[])[0]?.count || 0;
}

/**
 * Generic select with WHERE clause
 */
export async function selectWhere<T>(
  db: Connection,
  table: string,
  whereClause: string,
  params: any[] = []
): Promise<T[]> {
  const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
  const [rows] = await db.execute(query, params);
  return rows as T[];
}

/**
 * Generic select by ID
 */
export async function selectById<T>(
  db: Connection,
  table: string,
  idColumn: string,
  id: number
): Promise<T | undefined> {
  const [rows] = await db.execute(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [id]);
  return (rows as T[])[0];
}

/**
 * Generic select all
 */
export async function selectAll<T>(
  db: Connection,
  table: string,
  orderBy?: string
): Promise<T[]> {
  const query = orderBy 
    ? `SELECT * FROM ${table} ORDER BY ${orderBy}` 
    : `SELECT * FROM ${table}`;
  const [rows] = await db.execute(query);
  return rows as T[];
}

/**
 * Generic insert
 */
export async function insert(
  db: Connection,
  table: string,
  columns: string[],
  values: any[]
): Promise<number> {
  const placeholders = columns.map(() => '?').join(', ');
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
  const [result] = await db.execute(query, values);
  return (result as any).insertId;
}

/**
 * Generic update
 */
export async function update(
  db: Connection,
  table: string,
  idColumn: string,
  id: number,
  updates: Record<string, any>
): Promise<boolean> {
  const columns = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = columns.map(col => `${col} = ?`).join(', ');
  const query = `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = ?`;
  const [result] = await db.execute(query, [...values, id]);
  return (result as any).affectedRows > 0;
}

/**
 * Generic delete
 */
export async function deleteById(
  db: Connection,
  table: string,
  idColumn: string,
  id: number
): Promise<boolean> {
  const query = `DELETE FROM ${table} WHERE ${idColumn} = ?`;
  const [result] = await db.execute(query, [id]);
  return (result as any).affectedRows > 0;
}

export default { count, selectWhere, selectById, selectAll, insert, update, deleteById };
