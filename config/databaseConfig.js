import mysql from "mysql2";
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    port: 3306,
    database: 'escomtradeusdatabase',
    user: 'root',
    password: '93277239aA.'
});
export default pool;