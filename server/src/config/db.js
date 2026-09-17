import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'atap_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

export async function getDbPool() {
  if (pool) return pool;

  try {
    // 1. Intentar conectar al servidor MySQL (sin especificar la BD) para asegurar que atap_db exista
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();

    // 2. Crear pool apuntando a la base de datos atap_db
    pool = mysql.createPool(dbConfig);

    // Probar conexión
    const testConn = await pool.getConnection();
    testConn.release();
    isConnected = true;
    console.log(`[MySQL] Conexión establecida exitosamente con la base de datos "${dbConfig.database}".`);
    return pool;
  } catch (error) {
    console.error(`[MySQL] Error al conectar con MySQL en ${dbConfig.host}:${dbConfig.port}:`, error.message);
    console.warn(`[MySQL] Asegúrate de que tu servicio MySQL (XAMPP, WAMP, Laragon o servicio nativo) esté iniciado.`);
    isConnected = false;
    return null;
  }
}

export function isDbConnected() {
  return isConnected;
}

export async function query(sql, params = []) {
  const p = await getDbPool();
  if (!p) {
    throw new Error('No hay conexión activa con la base de datos MySQL.');
  }
  const [results] = await p.execute(sql, params);
  return results;
}

export default {
  getDbPool,
  isDbConnected,
  query
};
