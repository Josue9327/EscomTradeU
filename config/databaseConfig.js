import mysql from "mysql";
const pool = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    port: 3306,
    database: 'escomtradeusdatabase',
    user: 'root',
    password: 'root'
}); 
export default pool;