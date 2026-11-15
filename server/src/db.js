import mysql from 'mysql2/promise';
// Lazy pool: the landing runs without requiring a local MySQL instance.
export const pool = mysql.createPool({host:process.env.DB_HOST || '127.0.0.1',port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER || 'root',password:process.env.DB_PASSWORD || '',database:process.env.DB_NAME || 'lobbygol',waitForConnections:true,connectionLimit:5});
