import mysql from "mysql";
const pool = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    port: 3306,
    database: 'fepi',
    user: 'Charly',
    password: 'root'
}); 
export default pool;