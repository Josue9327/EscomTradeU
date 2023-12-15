import mysql from "mysql";
const pool = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    port: 3306,
    database: 'escomtradeusdatabase',
    user: 'root',
    password: '93277239aA.'
}); 
export default pool;